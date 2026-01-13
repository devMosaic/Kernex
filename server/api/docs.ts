import type { FastifyInstance } from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import fsSync from 'fs';

const DOCS_DIR = path.join(process.cwd(), 'docs');

interface DocEntry {
  type: 'file' | 'dir';
  name: string;
  title: string;
  path: string; // The URL slug
  children?: DocEntry[];
}

async function getFileTree(dir: string, relativePath = ''): Promise<DocEntry[]> {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const list: DocEntry[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(relativePath, entry.name); // FS path
    // URL slug: replace backslashes with forward slashes for consistency
    const slug = relPath.split(path.sep).join('/'); 

    if (entry.isDirectory()) {
      const children = await getFileTree(fullPath, relPath);
      // Only add directory if it has content
      if (children.length > 0) {
        list.push({
          type: 'dir',
          name: entry.name,
          title: formatTitle(entry.name),
          path: slug,
          children: children.sort(sortDocs)
        });
      }
    } else if (entry.name.endsWith('.md')) {
      const nameWithoutExt = entry.name.replace('.md', '');
      let entrySlug = slug.replace('.md', '');
      
      // Handle index.md -> maps to the parent folder's path
      if (nameWithoutExt === 'index' || nameWithoutExt === 'README') {
         entrySlug = path.dirname(relPath).split(path.sep).join('/');
         if (entrySlug === '.') entrySlug = '';
      }

      list.push({
        type: 'file',
        name: entry.name,
        title: formatTitle(nameWithoutExt),
        path: entrySlug,
      });
    }
  }

  return list.sort(sortDocs);
}

function formatTitle(name: string) {
  if (name === 'index' || name === 'README') return 'Overview';
  return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function sortDocs(a: DocEntry, b: DocEntry) {
  // Directories first? Or alphabetical?
  // Let's do directories first, then files.
  // But usually mixed is better if alphabetical.
  // Let's stick to alphabetical for now, maybe custom order later.
  // Exception: 'Overview' / index should be first.
  if (a.path === '' || a.name.startsWith('index')) return -1;
  if (b.path === '' || b.name.startsWith('index')) return 1;
  return a.title.localeCompare(b.title);
}

export default async function (fastify: FastifyInstance) {
  
  fastify.get('/tree', async () => {
    return getFileTree(DOCS_DIR);
  });

  fastify.get('/content', async (request, reply) => {
    const { slug } = request.query as { slug: string };
    
    // Normalize slug to safe path
    const safeSlug = (slug || '').replace(/\.\./g, ''); 
    
    // Candidates to check:
    // 1. docs/<slug>.md
    // 2. docs/<slug>/index.md
    // 3. docs/<slug>/README.md
    
    const candidates = [
        path.join(DOCS_DIR, safeSlug),
        path.join(DOCS_DIR, safeSlug + '.md'),
        path.join(DOCS_DIR, safeSlug, 'index.md'),
        path.join(DOCS_DIR, safeSlug, 'README.md')
    ];

    // Root case
    if (!safeSlug) {
        candidates.unshift(path.join(DOCS_DIR, 'index.md'));
        candidates.unshift(path.join(DOCS_DIR, 'README.md'));
    }

    for (const p of candidates) {
        if (fsSync.existsSync(p) && (await fs.stat(p)).isFile()) {
            const content = await fs.readFile(p, 'utf-8');
            return { content, path: p };
        }
    }

    return reply.status(404).send({ error: 'Document not found' });
  });
}
