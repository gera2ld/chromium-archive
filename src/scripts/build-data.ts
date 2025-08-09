import { platforms } from '$lib/constants';
import type { IPlatform } from '$lib/types';
import { Database } from 'bun:sqlite';
import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';

const DATA_DIR = 'src/data';

await mkdir(DATA_DIR, { recursive: true });

const db = new Database(`${DATA_DIR}/chromium-data.sqlite`);
db.exec(`
CREATE TABLE IF NOT EXISTS chromium_snapshots (
  prefix TEXT,
  revision INTEGER
);
CREATE TABLE IF NOT EXISTS chromium_milestones (
  milestone INTEGER UNIQUE,
  revision INTEGER
);
CREATE TABLE IF NOT EXISTS sync_logs (
  prefix TEXT UNIQUE,
  updatedAt TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_chromium_snapshots ON chromium_snapshots (prefix, revision);
`);

async function loadSnapshots(platform: string) {
	process.stdout.write(`\rChecking snapshots for ${platform}...`);
	const lastChangeUrl = `https://www.googleapis.com/download/storage/v1/b/chromium-browser-snapshots/o/${platform}%2FLAST_CHANGE?alt=media`;
	const res = await fetch(lastChangeUrl);
	const lastChange = +(await res.text());
	const stmt = db.query('SELECT * FROM chromium_snapshots WHERE prefix=? AND revision=?');
	const one = stmt.get(platform, lastChange);
	if (one) {
		process.stdout.write('update-to-date');
		console.log();
		return;
	}
	let total = 0;
	const baseUrl = `https://www.googleapis.com/storage/v1/b/chromium-browser-snapshots/o?delimiter=/&prefix=${platform}/&fields=items(kind,mediaLink,metadata,name,size,updated),kind,prefixes,nextPageToken`;
	let pageToken: string | undefined;
	while (true) {
		let url = baseUrl;
		if (pageToken) url = `${baseUrl}&pageToken=${pageToken}`;
		const res = await fetch(url);
		const { nextPageToken, prefixes } = (await res.json()) as {
			nextPageToken?: string;
			prefixes: string[];
		};
		const items = prefixes.flatMap((prefix) => {
			const [platform, rev] = prefix.split('/');
			const revision = +rev;
			return revision ? { platform, revision } : [];
		});
		const insert = db.prepare<number, [number, string]>(
			'INSERT OR IGNORE INTO chromium_snapshots (revision, prefix) VALUES (?, ?)',
		);
		const insertMany = db.transaction((items: { platform: IPlatform; revision: number }[]) => {
			for (const item of items) {
				insert.run(item.revision, item.platform);
			}
		});
		insertMany(items);
		total += items.length;
		process.stdout.write(`\rLoaded snapshots for ${platform}...${total}`);
		pageToken = nextPageToken;
		if (!pageToken) break;
	}
	db.run('INSERT OR REPLACE INTO sync_logs (prefix, updatedAt) VALUES(?, ?)', [
		platform,
		new Date().toISOString(),
	]);
	console.log();
}

async function loadBranches() {
	const res = await fetch('https://chromiumdash.appspot.com/fetch_milestones');
	const items = (await res.json()) as Array<{
		chromium_main_branch_position: number;
		milestone: number;
	}>;
	const insert = db.prepare<number, [number, number, number]>(
		'INSERT INTO chromium_milestones (milestone, revision) VALUES (?, ?) ON CONFLICT(milestone) DO UPDATE SET revision=?',
	);
	const insertMany = db.transaction((items) => {
		for (const item of items) {
			insert.run(
				item.milestone,
				item.chromium_main_branch_position,
				item.chromium_main_branch_position,
			);
		}
	});
	insertMany(items);
}

async function exportJson() {
	const stmt = db.query<{ milestone: number; prefix: IPlatform; revision: number }, []>(`\
SELECT
  m.milestone,
  p.prefix,
  (
    SELECT MAX(s.revision)
    FROM chromium_snapshots AS s
    WHERE s.prefix = p.prefix
      AND s.revision <= m.revision
  ) AS revision
FROM
  chromium_milestones AS m
JOIN
  (SELECT DISTINCT prefix FROM chromium_snapshots) AS p
ON EXISTS (
  SELECT 1
  FROM chromium_snapshots AS s_check
  WHERE s_check.prefix = p.prefix
    AND s_check.revision <= m.revision
)
ORDER BY revision, prefix
`);
	const records = stmt.all();
	const updatedAt = db
		.query<{ prefix: string; updatedAt: string }, []>('SELECT * FROM sync_logs')
		.all();
	await writeFile(
		`${DATA_DIR}/chromium-data.json`,
		JSON.stringify(
			{
				records,
				updatedAt,
			},
			null,
			2,
		),
	);
}

async function loadData() {
	for (const platform of platforms) {
		await loadSnapshots(platform);
	}
	await loadBranches();
	await exportJson();
}

await loadData();
