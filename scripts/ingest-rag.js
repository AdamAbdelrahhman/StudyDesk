// One-time StudyDesk RAG indexer. Requires Node.js 18+ and GEMINI_API_KEY.
const books = require('../rag-books.json');
const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error('Set GEMINI_API_KEY in your terminal environment first.');
const base='https://generativelanguage.googleapis.com/v1beta';
const uploadBase='https://generativelanguage.googleapis.com/upload/v1beta';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function json(url,opts={}){const r=await fetch(url,opts);const t=await r.text();let d={};try{d=JSON.parse(t)}catch{}if(!r.ok)throw new Error((d.error&&d.error.message)||t||('HTTP '+r.status));return {data:d,response:r};}
async function createStore(){const {data}=await json(base+'/fileSearchStores?key='+key,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({displayName:'StudyDesk Egypt Secondary 1 2026-2027 Official Curriculum'})});return data.name;}
async function upload(store,book,index){console.log('['+(index+1)+'/'+books.length+'] Downloading '+book.subject);
 const download=await fetch(book.url);if(!download.ok)throw new Error('Book download failed: '+book.subject+' HTTP '+download.status);
 const type=download.headers.get('content-type')||'application/pdf';const bytes=Buffer.from(await download.arrayBuffer());
 if(bytes.length<1000||bytes.subarray(0,5).toString()!=='%PDF-')throw new Error('Source did not return a valid PDF: '+book.subject);
 const start=await fetch(uploadBase+'/'+store+':uploadToFileSearchStore?key='+key,{method:'POST',headers:{'X-Goog-Upload-Protocol':'resumable','X-Goog-Upload-Command':'start','X-Goog-Upload-Header-Content-Length':String(bytes.length),'X-Goog-Upload-Header-Content-Type':type,'Content-Type':'application/json'},body:JSON.stringify({displayName:book.subject+' — '+book.grade+' — Term '+book.term,customMetadata:[{key:'subject',stringValue:book.subject},{key:'language',stringValue:book.language},{key:'grade',stringValue:book.grade},{key:'term',stringValue:book.term},{key:'school_year',stringValue:'2026-2027'}]})});
 if(!start.ok)throw new Error('Upload session failed for '+book.subject+': '+await start.text());
 const uploadUrl=start.headers.get('x-goog-upload-url');if(!uploadUrl)throw new Error('Gemini did not return upload URL for '+book.subject);
 const finish=await json(uploadUrl,{method:'POST',headers:{'Content-Length':String(bytes.length),'X-Goog-Upload-Offset':'0','X-Goog-Upload-Command':'upload, finalize','Content-Type':type},body:bytes});
 let op=finish.data;
 if(op.name&&!op.done){for(let n=0;n<90&&!op.done;n++){await sleep(3000);const poll=await json(base+'/'+op.name+'?key='+key);op=poll.data;}}
 if(op.error)throw new Error('Indexing failed for '+book.subject+': '+JSON.stringify(op.error));
 if(op.done===false)throw new Error('Indexing timed out for '+book.subject+'; rerun after checking store.');
 console.log('Indexed: '+book.subject+' ('+Math.round(bytes.length/1024)+' KB)');
}
(async()=>{let store=process.env.GEMINI_FILE_SEARCH_STORE;if(!store){store=await createStore();console.log('\nCreated File Search store: '+store+'\nSave this value as GEMINI_FILE_SEARCH_STORE in Vercel before deploying the RAG backend.\n');}
 for(let i=0;i<books.length;i++)await upload(store,books[i],i);
 console.log('\nDone. Indexed '+books.length+' official curriculum PDFs. Store: '+store);
})().catch(e=>{console.error(e);process.exit(1)});
