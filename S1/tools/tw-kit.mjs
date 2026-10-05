#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const script=fileURLToPath(import.meta.url);
const root=path.resolve(path.dirname(script),'..');
function out(kind,msg){console.log(`${kind.padEnd(7)} ${msg}`)}
async function hashFile(p){const b=await readFile(p);return createHash('sha256').update(b).digest('hex')}
async function walk(dir){let r=[];for(const n of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,n.name);if(n.isDirectory())r=r.concat(await walk(p));else if(n.isFile())r.push(p);else throw new Error(`Unsupported filesystem entry: ${p}`)}return r}
function rel(p){return path.relative(root,p).split(path.sep).join('/')}
const cfgPath=path.join(root,'90_AUDIT','KIT_CONFIG.json');
const cfg=JSON.parse(await readFile(cfgPath,'utf8'));
const requiredNode=cfg.requiredNode||'v24.21.0';
const requiredNpm=cfg.requiredNpm||'11.19.0';
function commandVersion(cmd,args){const r=spawnSync(cmd,args,{encoding:'utf8',shell:false});return {code:r.status??127,value:(r.stdout||'').trim(),stderr:(r.stderr||'').trim()}}
function env(allow=false){
  const npmCmd=process.platform==='win32'?'npm.cmd':'npm';
  const nr={code:0,value:process.version,stderr:''};
  const mr=commandVersion(npmCmd,['--version']);
  out('INFO',`platform=${process.platform} arch=${process.arch}`);
  const nodeOK=nr.value===requiredNode;
  const npmOK=mr.code===0&&mr.value===requiredNpm;
  out(nodeOK?'PASS':allow?'WARN':'FAIL',`Node ${nr.value}; required ${requiredNode}`);
  out(npmOK?'PASS':allow?'WARN':'FAIL',`npm ${mr.code===0?mr.value:'unavailable'}; required ${requiredNpm}`);
  if((nodeOK&&npmOK)||allow){out('VERDICT',nodeOK&&npmOK?'READY_RUNTIME':'RUNTIME_MISMATCH_ALLOWED_FOR_QA');return 0}
  out('VERDICT','NOT_READY_RUNTIME');return 2;
}
async function parseManifest(){const p=path.join(root,'90_AUDIT','PAYLOAD_SHA256SUMS.txt');const text=await readFile(p,'utf8');const m=new Map();for(const line of text.split(/\r?\n/)){if(!line.trim())continue;const x=line.match(/^([0-9a-f]{64})  (.+)$/);if(!x)throw new Error(`Invalid manifest line: ${line}`);m.set(x[2],x[1])}return m}
async function verify(){const expected=await parseManifest();const files=await walk(root);const actual=new Map(files.map(p=>[rel(p),p]));const allowed=new Set([...expected.keys(),'90_AUDIT/PAYLOAD_SHA256SUMS.txt','90_AUDIT/PACKAGE_ID.txt']);let fail=0;for(const [r,h] of expected){if(!actual.has(r)){out('FAIL',`missing ${r}`);fail++;continue}const a=await hashFile(actual.get(r));if(a!==h){out('FAIL',`hash ${r}`);fail++}}for(const r of actual.keys())if(!allowed.has(r)){out('FAIL',`extra ${r}`);fail++}if(fail){out('VERDICT','FAIL_PACKAGE_INTEGRITY_EXACT_SET');return 1}out('PASS',`${expected.size} payload files`);out('VERDICT','PASS_PACKAGE_INTEGRITY_EXACT_SET');return 0}
function run(cmd,args,cwd){return new Promise(resolve=>{const p=spawn(cmd,args,{cwd,stdio:'inherit',shell:false});p.on('exit',c=>resolve(c??128));p.on('error',e=>{console.error(e.message);resolve(127)})})}
function capture(cmd,args,cwd){return new Promise(resolve=>{const p=spawn(cmd,args,{cwd,stdio:['ignore','pipe','pipe'],shell:false});let stdout='',stderr='';p.stdout.on('data',b=>stdout+=b);p.stderr.on('data',b=>stderr+=b);p.on('exit',c=>resolve({code:c??128,stdout,stderr}));p.on('error',e=>resolve({code:127,stdout,stderr:e.message}))})}
const args=process.argv.slice(2);const command=args.shift()||'help';const allow=args.includes('--allow-runtime-mismatch')||process.env.TW2026_ALLOW_RUNTIME_MISMATCH==='1';
function project(id,role='student'){const p=cfg.projects?.[id]?.[role];if(!p)throw new Error(`Unknown project ${id}/${role}`);return path.join(root,...p.split('/'))}
function testArgs(suite){return suite==='all'?['--test','--test-reporter=tap']:['--test','--test-reporter=tap',`tests/${suite}.test.js`]}
async function runSuite(id,suite,role='student'){if(env(allow)!==0)return 2;return await run(process.execPath,testArgs(suite),project(id,role))}
async function captureSuite(id,suite,role='student'){return await capture(process.execPath,testArgs(suite),project(id,role))}
function tapFailureCount(text){return (text.match(/^not ok\s+\d+/gm)||[]).length}
async function initial(){if(env(allow)!==0)return 2;if(!cfg.initial)throw new Error('Initial-state contract is not defined for this kit');let fail=0;for(const [id,expect] of Object.entries(cfg.initial)){for(const suite of ['baseline','objective','regression']){const r=await captureSuite(id,suite);const notok=tapFailureCount(r.stdout);const expectedFailures=expect[suite].failures??0;const ok=r.code===expect[suite].code&&notok===expectedFailures;out(ok?'PASS':'FAIL',`${id} ${suite}: exit=${r.code} assertion_failures=${notok}; expected_exit=${expect[suite].code} expected_failures=${expectedFailures}`);if(!ok){console.log(r.stdout);console.error(r.stderr);fail++}}}out('VERDICT',fail?'FAIL_INITIAL_STATE':'PASS_INITIAL_STATE');return fail?1:0}
async function baselineSpec(){return JSON.parse(await readFile(path.join(root,'90_AUDIT','WORK_BASELINE.json'),'utf8'))}
async function result(){if(env(allow)!==0)return 2;if(!cfg.projects)throw new Error('Project contract is not defined for this kit');const b=await baselineSpec();let fail=0;for(const item of b.files){const p=path.join(root,...item.path.split('/'));try{const h=await hashFile(p);if(h!==item.sha256&&!b.allowed.includes(item.path)){out('FAIL',`unauthorised change ${item.path}`);fail++}}catch{out('FAIL',`missing ${item.path}`);fail++}}for(const [id] of Object.entries(cfg.projects)){for(const suite of ['baseline','objective','regression']){const r=await captureSuite(id,suite);const ok=r.code===0&&tapFailureCount(r.stdout)===0;out(ok?'PASS':'FAIL',`${id} ${suite}`);if(!ok){console.log(r.stdout);console.error(r.stderr);fail++}}}out('VERDICT',fail?'FAIL_WORK_RESULT':'PASS_WORK_RESULT');return fail?1:0}
async function start(id,role='student'){if(env(allow)!==0)return 2;return await run(process.execPath,['src/start.js'],project(id,role))}
async function runExample(id){if(env(allow)!==0)return 2;const ex=cfg.examples?.[id];if(!ex)throw new Error(`Unknown example ${id}`);return await run(process.execPath,[ex.entry],path.join(root,...ex.path.split('/')))}
async function main(){if(command==='verify')return await verify();if(command==='env')return env(allow);if(command==='initial')return await initial();if(command==='result')return await result();if(command==='test')return await runSuite(args[0],args[1]||'all',args[2]||'student');if(command==='start')return await start(args[0],args[1]||'student');if(command==='example')return await runExample(args[0]);if(command==='examples'){let c=0;for(const id of Object.keys(cfg.examples||{})){out('INFO',`example ${id}`);const r=await runExample(id);if(r)c=r}return c}console.log('Commands: verify | env | initial | result | test <id> <suite> [role] | start <id> [role] | example <id> | examples');return 0}
try{process.exitCode=await main()}catch(e){out('FAIL',e.stack||e.message);process.exitCode=2}
