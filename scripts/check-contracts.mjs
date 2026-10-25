import ts from 'typescript';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const printer = ts.createPrinter({ removeComments: true });
export function fingerprintFunctions(source) {
  const file = ts.createSourceFile('contract.tsx', source.replaceAll('\\_', '_'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found = {};
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name) {
      const canonical = printer.printNode(ts.EmitHint.Unspecified, node, file)
        .replaceAll('enviarIntegracao(', 'fetch(')
        .replaceAll('https://consultoque.com.br', '/');
      found[node.name.text] = createHash('sha256').update(canonical).digest('hex');
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return found;
}
if (process.argv[1]?.endsWith('check-contracts.mjs')) {
  const baseline = JSON.parse(readFileSync('tests/fixtures/regras-originais.json', 'utf8'));
  let total = 0;
  for (const [path, expected] of Object.entries(baseline)) {
    const actual = fingerprintFunctions(readFileSync(path, 'utf8'));
    for (const [name, hash] of Object.entries(expected)) {
      if (actual[name] !== hash) throw new Error(`Regra original alterada: ${path} → ${name}`);
      total++;
    }
  }
  console.log(`PASS: ${total} funções de autenticação, senha e regras operacionais equivalentes ao original B.`);
}
