'use strict';
let dataset;
const state = {conflict:'gaza', measure:'deaths', basis:'munitions', layer:'all', reportConflict:'all'};
const $ = id => document.getElementById(id);
const fmt = n => n === null || n === undefined ? 'Not available' : new Intl.NumberFormat('en-GB').format(n);
const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL = s => {try{const u=new URL(s);return u.protocol==='https:' ? u.href : '#';}catch{return '#';}};
const date = s => new Date(s+'T12:00:00Z').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
function eligibleRatio(pair,measure){
  if(!pair || !pair.numerator || !pair.denominator) return null;
  const n=pair.numerator,d=pair.denominator;
  const keys=['actor','geography','start','end','weaponCategory','coverageId'];
  if(keys.some(k=>!n[k]||n[k]!==d[k])) return null;
  if(n.measure!==measure||n.civilianOnly!==true||n.directHarm!==true||d.unit!=='munitions_fired'||d.includesDecoys!==false||d.completeForScope!==true||!['independent','official'].includes(n.layer)||!['independent','official'].includes(d.layer))return null;
  if(!Number.isFinite(n.value)||n.value<0||!Number.isFinite(d.value)||d.value<=0||!n.source||!d.source)return null;
  return n.value/d.value*1000;
}
function incidentRate(value,count){return Number.isFinite(value)&&Number.isFinite(count)&&count>0 ? (value/count).toFixed(2) : null;}
function renderCards(){
  $('conflict-cards').innerHTML=dataset.conflicts.map(c=>`<button type="button" class="conflict-card" data-conflict="${esc(c.id)}" aria-pressed="${state.conflict===c.id}"><span class="card-head">${esc(c.name)}<span class="card-rank">BASELINE ${String(c.rank).padStart(2,'0')}</span></span><strong class="card-number">${fmt(c.deaths)}</strong><span class="card-label">civilian deaths recorded · 2025</span><span class="card-track"><span class="card-fill" style="width:${c.deaths/Math.max(...dataset.conflicts.map(x=>x.deaths))*100}%"></span></span><span class="card-bottom"><span>${fmt(c.incidents)} harmful incidents recorded</span><span aria-hidden="true">↗</span></span></button>`).join('');
  document.querySelectorAll('[data-conflict]').forEach(b=>b.addEventListener('click',()=>setConflict(b.dataset.conflict)));
}
function setConflict(id){if(!dataset.conflicts.some(c=>c.id===id))throw new Error('Unknown conflict');state.conflict=id;renderCards();renderComparison();}
function renderComparison(){
  const c=dataset.conflicts.find(c=>c.id===state.conflict),m=state.measure;
  $('selected-title').textContent=c.name;
  $('actor-scope').textContent=c.scope;
  if(state.basis==='munitions'){
    $('ratio-summary').innerHTML='<span class="ratio-value">—</span><div class="ratio-copy"><strong>Insufficient comparable data</strong><p>No matched 2025 civilian-harm and munition-expenditure series has been admitted for this conflict. Recorded incidents cannot substitute for individual weapons fired.</p></div><span class="tag">RATIO WITHHELD</span>';
  }else{
    $('ratio-summary').innerHTML=`<span class="ratio-value">${incidentRate(c[m],c.incidents)}</span><div class="ratio-copy"><strong>Civilian ${m} per recorded casualty-producing incident</strong><p>${fmt(c[m])} ÷ ${fmt(c.incidents)} · ${esc(c.baselineLocation)}, 2025. Includes only AOAV’s reporting sample; excludes unreported and casualty-free attacks. Not a deaths-per-munition measure.</p></div>`;
  }
  const max=Math.max(1,...c.actors.map(a=>a[m]||0));
  $('actor-rows').innerHTML=c.actors.map(a=>{const n=a[m],rate=incidentRate(n,a.incidents);return `<div class="actor-row"><div class="actor-name"><span>${esc(a.name)}</span><strong>${n===null?'—':fmt(n)}</strong></div>${n!==null?`<div class="actor-track"><div class="actor-fill" style="width:${n/max*100}%"></div></div>`:''}<p class="small">${esc(a.note)}${state.basis==='incidents'&&rate!==null?` ${rate} ${m} per recorded harmful incident.`:''}</p></div>`;}).join('');
  const categories=['Artillery & mortars','Unguided rockets','Short-range drones','One-way attack drones','Ballistic missiles','Cruise missiles','Guided / glide bombs','Other bombs'];
  $('weapon-rows').innerHTML=state.basis==='munitions'?categories.map(w=>`<div class="weapon-row"><span>${esc(w)}</span><span>No matched count</span></div>`).join(''):c.weapons.map(w=>`<div class="weapon-row"><span>${esc(w.name)}</span><span>${incidentRate(w[m],w.incidents)??'—'} ${m} / incident</span><span class="small">${w[m]===null?'Split not admitted':fmt(w[m])+' '+m} · ${fmt(w.incidents)} harmful incidents</span></div>`).join('');
  $('baseline-note').innerHTML=`${esc(c.note)} <a href="${safeURL(dataset.baselineSource)}" target="_blank" rel="noopener">Source: AOAV, printed pages ${esc(c.sourcePages)} ↗</a>`;
}
function renderReports(){
 const reports=dataset.reports.filter(r=>(state.layer==='all'||r.layer===state.layer)&&(state.reportConflict==='all'||r.conflict===state.reportConflict)).sort((a,b)=>b.published.localeCompare(a.published));
 $('report-list').innerHTML=reports.length?reports.map(r=>`<article class="report"><div class="report-date">${esc(date(r.published))}<strong>${esc(dataset.conflicts.find(c=>c.id===r.conflict)?.name)}</strong></div><div><span class="tag ${r.layer==='official'?'official':''}">${r.layer==='official'?'OFFICIAL CLAIM':'INDEPENDENT REPORTING'}</span><h3>${esc(r.title)}</h3><small>Observation period: ${esc(r.period)}</small><p>${esc(r.summary)}</p><small>${esc(r.verification)}</small></div><div class="report-source"><a href="${safeURL(r.url)}" target="_blank" rel="noopener">${esc(r.publisher)} ↗</a><small>Origin: ${esc(r.origin)}</small></div></article>`).join(''):'<p class="empty">No admitted records for this selection. This is a reporting gap, not evidence of zero casualties.</p>';
}
function renderReview(){
 $('review-date').textContent=date(dataset.reviewedAt);
 const days=Math.floor((Date.now()-Date.parse(dataset.reviewedAt+'T00:00:00Z'))/86400000);
 $('refresh-status').textContent=(days>2?'Historical snapshot. ':'')+dataset.reviewStatus;
 if(days>2)$('refresh-status').classList.add('stale');
 $('schedule-description').textContent=dataset.automation.description;
}
async function init(){
 try{
  const response=await fetch('data.json',{cache:'no-store'});if(!response.ok)throw new Error('Evidence unavailable');dataset=await response.json();
  if(dataset.schemaVersion!==1||!Array.isArray(dataset.conflicts)||!Array.isArray(dataset.reports))throw new Error('Invalid evidence format');
  renderReview();renderCards();renderComparison();renderReports();
  $('measure').addEventListener('change',e=>{state.measure=e.target.value;renderComparison();});
  $('basis').addEventListener('change',e=>{state.basis=e.target.value;renderComparison();});
  $('report-conflict').addEventListener('change',e=>{state.reportConflict=e.target.value;renderReports();});
  $('evidence-layer').addEventListener('change',e=>{state.layer=e.target.value;renderReports();});
  if(document.modelContext?.registerTool){
   const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
   Promise.resolve(document.modelContext.registerTool({name:'view_conflict_evidence',description:'Select a conflict and evidence layer in this dashboard. Returns the reporting scope and matching records; does not alter stored evidence.',inputSchema:{type:'object',properties:{conflict:{type:'string',enum:['gaza','sudan','ukraine']},layer:{type:'string',enum:['all','independent','official']}},required:['conflict','layer'],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},execute(input){if(!input||!['all','independent','official'].includes(input.layer)||!dataset.conflicts.some(c=>c.id===input.conflict))throw new Error('Invalid conflict or layer');setConflict(input.conflict);state.reportConflict=input.conflict;state.layer=input.layer;$('report-conflict').value=input.conflict;$('evidence-layer').value=input.layer;renderReports();return {conflict:input.conflict,scope:dataset.conflicts.find(c=>c.id===input.conflict).scope,reports:dataset.reports.filter(r=>r.conflict===input.conflict&&(input.layer==='all'||r.layer===input.layer))};}},{signal:lifecycle.signal})).catch(()=>{});
  }
 }catch(error){$('review-date').textContent='Evidence unavailable';$('refresh-status').textContent='The evidence register could not be loaded. Please reload this page.';$('selected-title').textContent='Unable to load comparison';$('report-list').innerHTML='<p class="empty">Source links and methodology remain available. No numerical results are shown until the evidence register loads.</p>';}
}
init();
