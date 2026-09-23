const $ = s => document.querySelector(s);

const projects = [
  {
    id: 1,
    title: "Registro de datos",
    kicker: "PROYECTO 1 · ENTRADAS Y SALIDAS",
    repo: "proyecto-datos-streamlit",
    requirements: "streamlit",
    appCode: `import streamlit as st

st.title("Registro de datos personales")

nombre = st.text_input("Nombre")
telefono = st.text_input("Teléfono")
cedula = st.text_input("Cédula")

if st.button("Mostrar datos"):
    st.write("Nombre:", nombre)
    st.write("Teléfono:", telefono)
    st.write("Cédula:", cedula)`,
    appTokens: [
      "importstreamlitasst",
      'st.title("registrodedatospersonales")',
      'nombre=st.text_input("nombre")',
      'telefono=st.text_input("teléfono")',
      'cedula=st.text_input("cédula")',
      'ifst.button("mostrardatos"):',
      'st.write("nombre:",nombre)',
      'st.write("teléfono:",telefono)',
      'st.write("cédula:",cedula)'
    ]
  },
  {
    id: 2,
    title: "Calculadora",
    kicker: "PROYECTO 2 · CONDICIONES Y OPERACIONES",
    repo: "calculadora-streamlit",
    requirements: "streamlit",
    appCode: `import streamlit as st

st.title("Calculadora básica")

numero1 = st.number_input("Primer número")
numero2 = st.number_input("Segundo número")

operacion = st.selectbox(
    "Operación",
    ["Sumar", "Restar", "Multiplicar", "Dividir"]
)

if st.button("Calcular"):
    if operacion == "Sumar":
        resultado = numero1 + numero2
    elif operacion == "Restar":
        resultado = numero1 - numero2
    elif operacion == "Multiplicar":
        resultado = numero1 * numero2
    else:
        if numero2 == 0:
            st.error("No se puede dividir entre cero")
            st.stop()
        resultado = numero1 / numero2

    st.success(f"Resultado: {resultado}")`,
    appTokens: [
      "importstreamlitasst",
      'st.title("calculadorabásica")',
      'numero1=st.number_input("primernúmero")',
      'numero2=st.number_input("segundonúmero")',
      'operacion=st.selectbox(',
      '"sumar"',
      '"restar"',
      '"multiplicar"',
      '"dividir"',
      'ifst.button("calcular"):',
      'resultado=numero1+numero2',
      'resultado=numero1-numero2',
      'resultado=numero1*numero2',
      'resultado=numero1/numero2',
      'st.success(f"resultado:{resultado}")'
    ]
  },
  {
    id: 3,
    title: "Mini dashboard",
    kicker: "PROYECTO 3 · DATOS, GRÁFICA Y RESUMEN",
    repo: "mini-dashboard-streamlit",
    requirements: "streamlit\npandas",
    appCode: `import streamlit as st
import pandas as pd

st.title("Mini dashboard")

datos = pd.DataFrame({
    "Actividad": ["A", "B", "C", "D", "E"],
    "Cantidad": [10, 15, 8, 20, 12]
})

st.subheader("Datos")
st.dataframe(datos, use_container_width=True)

st.subheader("Gráfica")
st.bar_chart(datos.set_index("Actividad"))

total = datos["Cantidad"].sum()
promedio = datos["Cantidad"].mean()

st.subheader("Resumen")
st.write("Total:", total)
st.write("Promedio:", round(promedio, 2))`,
    appTokens: [
      "importstreamlitasst",
      "importpandasaspd",
      'st.title("minidashboard")',
      "datos=pd.dataframe({",
      '"actividad":',
      '"cantidad":',
      "st.dataframe(datos",
      'st.bar_chart(datos.set_index("actividad"))',
      'total=datos["cantidad"].sum()',
      'promedio=datos["cantidad"].mean()',
      'st.write("total:",total)',
      'st.write("promedio:",round(promedio,2))'
    ]
  }
];

const steps = [
  {
    title: "Crear el archivo app.py",
    prompt: "Usá el código del proyecto y pasalo al Bloc de notas simulado. Luego validá que el archivo contiene las instrucciones necesarias.",
    type: "app"
  },
  {
    title: "Guardar app.py correctamente",
    prompt: "Simulá la ventana Guardar como. El nombre, el tipo de archivo y la codificación deben quedar como en la guía.",
    type: "saveApp"
  },
  {
    title: "Crear requirements.txt",
    prompt: "Ahora prepará el segundo archivo. Debe contener únicamente las librerías necesarias para este proyecto.",
    type: "requirements"
  },
  {
    title: "Guardar requirements.txt",
    prompt: "Guardá el segundo archivo con su extensión correcta, usando Todos los archivos y UTF-8.",
    type: "saveReq"
  },
  {
    title: "Crear el repositorio en GitHub",
    prompt: "Simulá el procedimiento + → New repository y configurá el repositorio del proyecto.",
    type: "repo"
  },
  {
    title: "Subir archivos y hacer commit",
    prompt: "Simulá Add file → Upload files. Los dos archivos deben quedar en la raíz del repositorio y tenés que registrar el cambio.",
    type: "upload"
  },
  {
    title: "Configurar Streamlit Community Cloud",
    prompt: "Simulá Create app → Yup, I have an app. Indicá repositorio, rama y archivo principal antes de desplegar.",
    type: "deploy"
  },
  {
    title: "Probar la aplicación publicada",
    prompt: "Usá la vista previa como si fuera la app publicada. Completá la prueba funcional solicitada para cerrar el proyecto.",
    type: "test"
  }
];

let state = {
  name: "",
  project: 0,
  step: 0,
  done: 0,
  errors: 0,
  firstTry: 0,
  attempts: {},
  start: null,
  seconds: 0,
  timerId: null,
  testPassed: false
};

function show(id){
  ["welcome","lab","results"].forEach(x => $("#" + x).classList.add("hidden"));
  $("#" + id).classList.remove("hidden");
}

function fmt(sec){
  const m = String(Math.floor(sec/60)).padStart(2,"0");
  const s = String(sec%60).padStart(2,"0");
  return `${m}:${s}`;
}

function normalizeCode(s){
  return (s || "")
    .toLowerCase()
    .replace(/\r/g,"")
    .replace(/[ \t\n]+/g,"")
    .replace(/'/g,'"');
}

function escaped(s){
  return String(s).replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[ch]));
}

function start(){
  const name = $("#studentName").value.trim();
  if(!name){
    $("#studentName").focus();
    return;
  }
  state = {
    name, project:0, step:0, done:0, errors:0, firstTry:0,
    attempts:{}, start:Date.now(), seconds:0, timerId:null, testPassed:false
  };
  state.timerId = setInterval(() => {
    state.seconds = Math.floor((Date.now()-state.start)/1000);
    $("#timer").textContent = fmt(state.seconds);
  },1000);
  $("#hud").classList.remove("hidden");
  show("lab");
  render();
}

function currentKey(){
  return `${state.project}-${state.step}`;
}

function markAttempt(){
  const k = currentKey();
  state.attempts[k] = (state.attempts[k] || 0) + 1;
  return state.attempts[k];
}

function renderMap(){
  const wrap = $("#projectMap");
  wrap.innerHTML = "";
  projects.forEach((p,pi) => {
    const complete = pi < state.project;
    const active = pi === state.project;
    const locked = pi > state.project;
    const card = document.createElement("div");
    card.className = `project-card ${complete?"done":""} ${active?"active":""} ${locked?"locked":""}`;
    let dots = "";
    for(let si=0;si<8;si++){
      let cls = "";
      if(complete || (active && si < state.step)) cls = "done";
      if(active && si === state.step) cls = "current";
      dots += `<i class="step-dot ${cls}"></i>`;
    }
    card.innerHTML = `
      <div class="project-card-head">
        <span>0${p.id}</span>
        <b>${p.title}</b>
      </div>
      <div class="step-dots">${dots}</div>
    `;
    wrap.appendChild(card);
  });
}

function render(){
  const p = projects[state.project];
  const s = steps[state.step];
  $("#hudProject").textContent = state.project + 1;
  $("#hudStep").textContent = state.step + 1;
  $("#hudDone").textContent = state.done;
  $("#hudErrors").textContent = state.errors;
  $("#projectTag").textContent = `PROYECTO ${p.id}`;
  $("#stepTag").textContent = `PASO ${state.step+1} DE 8`;
  $("#challengeNumber").textContent = String(state.project*8 + state.step + 1).padStart(2,"0");
  $("#projectKicker").textContent = p.kicker;
  $("#title").textContent = s.title;
  $("#prompt").textContent = s.prompt;
  $("#progressBar").style.width = `${(state.done/24)*100}%`;
  $("#feedback").className = "feedback hidden";
  $("#feedback").innerHTML = "";
  $("#checkBtn").classList.remove("hidden");
  $("#nextBtn").classList.add("hidden");
  $("#nextBtn").textContent = (state.step === 7 && state.project < 2) ? "SIGUIENTE PROYECTO →" : (state.project===2 && state.step===7 ? "VER RESULTADOS →" : "SIGUIENTE PASO →");
  state.testPassed = false;

  renderMap();
  renderWorkspace(s.type,p);
}

function renderWorkspace(type,p){
  const w = $("#workspace");
  if(type === "app"){
    w.innerHTML = `
      <div class="instruction-box">
        <b>1. Código del proyecto</b>
        <p>Leé el código, copialo y pasalo al editor que representa el Bloc de notas. Podés consultar la guía si necesitás recordar cómo se guarda después.</p>
      </div>
      <div class="source-code">
        <div class="window-bar">
          <span>Código que debes utilizar</span>
          <span>app.py</span>
        </div>
        <pre>${escaped(p.appCode)}</pre>
        <div class="copy-note">Tip: en una práctica real copiarías este código y lo pegarías en Bloc de notas.</div>
      </div>
      <div class="notepad">
        <div class="window-bar">
          <span>Bloc de notas · Sin título</span>
          <span>Archivo · Editar · Ver</span>
        </div>
        <textarea id="appEditor" class="editor-area" spellcheck="false" placeholder="Pegá o escribí aquí el código de app.py..."></textarea>
      </div>
    `;
  }

  if(type === "saveApp" || type === "saveReq"){
    const file = type === "saveApp" ? "app.py" : "requirements.txt";
    w.innerHTML = `
      <div class="instruction-box">
        <b>Simulación de Guardar como</b>
        <p>Completá esta ventana como lo harías desde Bloc de notas. Prestá atención a la extensión del archivo.</p>
      </div>
      <div class="save-dialog">
        <div class="window-bar"><span>Guardar como</span><span>Escritorio</span></div>
        <div class="field-grid">
          <div class="field full">
            <label>Nombre de archivo</label>
            <input id="saveName" class="text-input" placeholder="Escribe el nombre del archivo">
          </div>
          <div class="field">
            <label>Tipo</label>
            <select id="saveType">
              <option value="">Selecciona...</option>
              <option value="txt">Documentos de texto (*.txt)</option>
              <option value="all">Todos los archivos (*.*)</option>
            </select>
          </div>
          <div class="field">
            <label>Codificación</label>
            <select id="saveEncoding">
              <option value="">Selecciona...</option>
              <option value="ansi">ANSI</option>
              <option value="utf8">UTF-8</option>
              <option value="utf16">UTF-16</option>
            </select>
          </div>
        </div>
        <div class="save-actions">
          <button class="fake-btn">Cancelar</button>
          <button class="fake-btn accent">Guardar</button>
        </div>
      </div>
      <div class="instruction-box">
        <b>Archivo esperado</b>
        <p>Debe terminar exactamente como <code>${file}</code>. No debe quedar <code>${file}.txt</code>.</p>
      </div>
    `;
  }

  if(type === "requirements"){
    w.innerHTML = `
      <div class="instruction-box">
        <b>Dependencias del proyecto</b>
        <p>Este proyecto necesita las siguientes librerías. Pasalas al Bloc de notas simulado sin comillas ni texto adicional.</p>
      </div>
      <div class="source-code">
        <div class="window-bar"><span>Contenido requerido</span><span>requirements.txt</span></div>
        <pre>${escaped(p.requirements)}</pre>
      </div>
      <div class="notepad">
        <div class="window-bar"><span>Bloc de notas · Sin título</span><span>Archivo · Editar · Ver</span></div>
        <textarea id="reqEditor" class="editor-area" style="min-height:150px" spellcheck="false" placeholder="Escribí aquí el contenido de requirements.txt..."></textarea>
      </div>
    `;
  }

  if(type === "repo"){
    w.innerHTML = `
      <div class="browser-mock">
        <div class="browser-bar">
          <span>←</span><span>→</span><span>↻</span>
          <div class="browser-pill">github.com</div>
        </div>
        <div class="site-body">
          <div class="gh-top">
            <div class="gh-logo">GitHub</div>
            <div style="position:relative">
              <button id="ghPlus" class="gh-plus">+ ▾</button>
              <div id="ghMenu" class="gh-menu">
                <button id="newRepoBtn">New repository</button>
                <button>Import repository</button>
              </div>
            </div>
          </div>
          <div class="click-path">Primero: + → New repository</div>
          <div id="repoForm" class="gh-form hidden">
            <h3>Create a new repository</h3>
            <div class="light-field">
              <label>Repository name</label>
              <input id="repoName" placeholder="${p.repo}">
            </div>
            <div class="radio-line">
              <label><input type="radio" name="visibility" value="public"> Public</label>
              <label><input type="radio" name="visibility" value="private"> Private</label>
            </div>
            <div class="radio-line">
              <label><input id="readme" type="checkbox"> Add a README file</label>
            </div>
            <div class="light-field">
              <label>.gitignore</label>
              <select id="gitignore"><option value="none">None</option><option value="python">Python</option></select>
            </div>
            <div class="light-field">
              <label>License</label>
              <select id="license"><option value="none">None</option><option value="mit">MIT License</option></select>
            </div>
            <button class="gh-green">Create repository</button>
          </div>
        </div>
      </div>
    `;
    $("#ghPlus").onclick = () => $("#ghMenu").classList.toggle("open");
    $("#newRepoBtn").onclick = () => {
      $("#ghMenu").classList.remove("open");
      $("#repoForm").classList.remove("hidden");
    };
  }

  if(type === "upload"){
    w.innerHTML = `
      <div class="browser-mock">
        <div class="browser-bar">
          <span>←</span><span>→</span><span>↻</span>
          <div class="browser-pill">github.com/tuusuario/${p.repo}</div>
        </div>
        <div class="site-body">
          <div class="gh-top">
            <div><b>${p.repo}</b> <small style="color:#57606a">Public</small></div>
            <button id="addFileBtn" class="gh-plus">Add file ▾</button>
          </div>
          <div id="uploadMenu" class="gh-menu" style="position:static;width:210px;margin:0 0 12px auto">
            <button id="uploadFilesBtn">Upload files</button>
            <button>Create new file</button>
          </div>
          <div id="uploadPanel" class="hidden">
            <div class="upload-zone">
              <b>Upload files</b>
              <p style="font-size:12px;color:#57606a">Seleccioná los archivos que van a quedar en la raíz del repositorio.</p>
              <label class="file-chip"><span><b>app.py</b><small> archivo principal</small></span><input id="fileApp" type="checkbox"></label>
              <label class="file-chip"><span><b>requirements.txt</b><small> dependencias</small></span><input id="fileReq" type="checkbox"></label>
              <label class="file-chip"><span><b>carpeta-extra/</b><small> no necesaria</small></span><input id="fileExtra" type="checkbox"></label>
            </div>
            <div class="commit-box">
              <b>Commit changes</b>
              <p style="font-size:12px;color:#57606a">Escribí un mensaje claro para registrar este cambio.</p>
              <input id="commitMsg" placeholder="Ejemplo: Primera versión de la aplicación">
            </div>
          </div>
        </div>
      </div>
    `;
    $("#addFileBtn").onclick = () => $("#uploadMenu").classList.toggle("open");
    $("#uploadFilesBtn").onclick = () => {
      $("#uploadMenu").classList.add("hidden");
      $("#uploadPanel").classList.remove("hidden");
    };
  }

  if(type === "deploy"){
    w.innerHTML = `
      <div class="browser-mock">
        <div class="browser-bar">
          <span>←</span><span>→</span><span>↻</span>
          <div class="browser-pill">share.streamlit.io</div>
        </div>
        <div class="streamlit-body">
          <div class="st-head">
            <div class="st-logo">streamlit</div>
            <button id="createAppBtn" class="st-create">Create app</button>
          </div>
          <div class="click-path">Primero: Create app → Yup, I have an app</div>
          <div id="choiceCard" class="st-card hidden">
            <h3>Do you already have an app?</h3>
            <button id="haveAppBtn" class="st-create">Yup, I have an app</button>
          </div>
          <div id="deployForm" class="st-card hidden">
            <h3>Deploy an app</h3>
            <div class="st-field">
              <label>Repository</label>
              <input id="stRepo" placeholder="tuusuario/${p.repo}">
            </div>
            <div class="st-field">
              <label>Branch</label>
              <input id="stBranch" placeholder="main">
            </div>
            <div class="st-field">
              <label>Main file path</label>
              <input id="stMain" placeholder="app.py">
            </div>
            <div class="st-field">
              <label>App URL (opcional)</label>
              <input id="stUrl" placeholder="${p.repo}">
            </div>
            <button class="st-deploy">Deploy!</button>
          </div>
        </div>
      </div>
    `;
    $("#createAppBtn").onclick = () => $("#choiceCard").classList.remove("hidden");
    $("#haveAppBtn").onclick = () => {
      $("#choiceCard").classList.add("hidden");
      $("#deployForm").classList.remove("hidden");
    };
  }

  if(type === "test"){
    if(p.id === 1) renderTest1(w);
    if(p.id === 2) renderTest2(w);
    if(p.id === 3) renderTest3(w);
  }
}

function renderTest1(w){
  w.innerHTML = `
    <div class="instruction-box">
      <b>Prueba funcional</b>
      <p>Escribí nombre, teléfono y cédula. Luego presioná Mostrar datos. La app debe imprimir los tres valores.</p>
    </div>
    <div class="preview-frame">
      <div class="window-bar"><span>proyecto-datos-streamlit.streamlit.app</span><span>● Online</span></div>
      <div class="preview-app">
        <h3>Registro de datos personales</h3>
        <div class="preview-field"><label>Nombre</label><input id="pvName"></div>
        <div class="preview-field"><label>Teléfono</label><input id="pvPhone"></div>
        <div class="preview-field"><label>Cédula</label><input id="pvId"></div>
        <button id="pvShow" class="preview-button">Mostrar datos</button>
        <div id="pvOut" class="preview-output hidden"></div>
      </div>
    </div>
  `;
  $("#pvShow").onclick = () => {
    const n=$("#pvName").value.trim(), ph=$("#pvPhone").value.trim(), id=$("#pvId").value.trim();
    if(!n || !ph || !id){
      $("#pvOut").classList.remove("hidden");
      $("#pvOut").textContent = "Completá los tres datos antes de probar.";
      state.testPassed = false;
      return;
    }
    $("#pvOut").classList.remove("hidden");
    $("#pvOut").innerHTML = `<b>Nombre:</b> ${escaped(n)}<br><b>Teléfono:</b> ${escaped(ph)}<br><b>Cédula:</b> ${escaped(id)}`;
    state.testPassed = true;
  };
}

function renderTest2(w){
  w.innerHTML = `
    <div class="instruction-box">
      <b>Prueba funcional</b>
      <p>Ingresá dos números, elegí una operación y presioná Calcular. Debe aparecer el resultado correcto.</p>
    </div>
    <div class="preview-frame">
      <div class="window-bar"><span>calculadora-streamlit.streamlit.app</span><span>● Online</span></div>
      <div class="preview-app">
        <h3>Calculadora básica</h3>
        <div class="preview-row">
          <div class="preview-field"><label>Primer número</label><input id="calcA" type="number" value="10"></div>
          <div class="preview-field"><label>Segundo número</label><input id="calcB" type="number" value="5"></div>
        </div>
        <div class="preview-field">
          <label>Operación</label>
          <select id="calcOp">
            <option>Sumar</option><option>Restar</option><option>Multiplicar</option><option>Dividir</option>
          </select>
        </div>
        <button id="calcBtn" class="preview-button">Calcular</button>
        <div id="calcOut" class="preview-output hidden"></div>
      </div>
    </div>
  `;
  $("#calcBtn").onclick = () => {
    const a=Number($("#calcA").value), b=Number($("#calcB").value), op=$("#calcOp").value;
    if(!Number.isFinite(a) || !Number.isFinite(b)){ state.testPassed=false; return; }
    let r;
    if(op==="Sumar") r=a+b;
    if(op==="Restar") r=a-b;
    if(op==="Multiplicar") r=a*b;
    if(op==="Dividir"){
      if(b===0){
        $("#calcOut").classList.remove("hidden");
        $("#calcOut").textContent="No se puede dividir entre cero";
        state.testPassed = true;
        return;
      }
      r=a/b;
    }
    $("#calcOut").classList.remove("hidden");
    $("#calcOut").innerHTML = `<b>Resultado:</b> ${r}`;
    state.testPassed = true;
  };
}

function renderTest3(w){
  const rows = [
    ["A",10],["B",15],["C",8],["D",20],["E",12]
  ];
  w.innerHTML = `
    <div class="instruction-box">
      <b>Prueba funcional</b>
      <p>Trabajá únicamente con 5 filas. Podés cambiar las actividades o cantidades y luego presionar Actualizar dashboard.</p>
    </div>
    <div class="preview-frame">
      <div class="window-bar"><span>mini-dashboard-streamlit.streamlit.app</span><span>● Online</span></div>
      <div class="preview-app">
        <h3>Mini dashboard</h3>
        <table class="data-table">
          <thead><tr><th>Actividad</th><th>Cantidad</th></tr></thead>
          <tbody>
            ${rows.map((r,i)=>`<tr><td><input id="act${i}" value="${r[0]}"></td><td><input id="qty${i}" type="number" value="${r[1]}"></td></tr>`).join("")}
          </tbody>
        </table>
        <button id="dashBtn" class="preview-button">Actualizar dashboard</button>
        <div id="dashOut" class="hidden">
          <div id="chart" class="chart"></div>
          <div class="metrics">
            <div class="metric"><small>Total</small><b id="metricTotal">0</b></div>
            <div class="metric"><small>Promedio</small><b id="metricAvg">0</b></div>
          </div>
        </div>
      </div>
    </div>
  `;
  $("#dashBtn").onclick = () => {
    const labels=[], values=[];
    for(let i=0;i<5;i++){
      labels.push($("#act"+i).value.trim() || `Fila ${i+1}`);
      values.push(Number($("#qty"+i).value));
    }
    if(values.some(v=>!Number.isFinite(v))){
      state.testPassed=false;
      return;
    }
    const max = Math.max(...values.map(v=>Math.abs(v)),1);
    $("#chart").innerHTML = values.map((v,i)=>{
      const h = Math.max(4, Math.abs(v)/max*120);
      return `<div class="bar" style="height:${h}px" title="${escaped(labels[i])}: ${v}"><span>${escaped(labels[i])}</span></div>`;
    }).join("");
    const total=values.reduce((a,b)=>a+b,0);
    const avg=total/5;
    $("#metricTotal").textContent=total;
    $("#metricAvg").textContent=avg.toFixed(2);
    $("#dashOut").classList.remove("hidden");
    state.testPassed=true;
  };
}

function validate(){
  const p=projects[state.project];
  const type=steps[state.step].type;
  const attempt=markAttempt();
  let ok=false, msg="";

  if(type==="app"){
    const raw=$("#appEditor").value;
    const n=normalizeCode(raw);
    const missing=p.appTokens.filter(t=>!n.includes(normalizeCode(t)));
    ok=raw.trim().length>40 && missing.length===0;
    msg=ok
      ? "El contenido de app.py incluye las instrucciones esenciales del proyecto."
      : `Revisá el código de app.py. ${missing.length ? "Faltan o están diferentes algunas instrucciones importantes." : "El archivo todavía está incompleto."}`;
  }

  if(type==="saveApp"){
    ok=$("#saveName").value.trim().toLowerCase()==="app.py" &&
       $("#saveType").value==="all" &&
       $("#saveEncoding").value==="utf8";
    msg=ok ? "app.py quedó configurado correctamente para guardarse sin una extensión .txt adicional."
           : "Revisá: nombre app.py, Tipo = Todos los archivos (*.*) y Codificación = UTF-8.";
  }

  if(type==="requirements"){
    const value=$("#reqEditor").value.trim().toLowerCase().replace(/\r/g,"");
    const expected=p.requirements.trim().toLowerCase().replace(/\r/g,"");
    ok=value===expected;
    msg=ok ? "requirements.txt contiene exactamente las librerías necesarias."
           : `Para este proyecto el contenido debe ser:\n${p.requirements}`;
  }

  if(type==="saveReq"){
    ok=$("#saveName").value.trim().toLowerCase()==="requirements.txt" &&
       $("#saveType").value==="all" &&
       $("#saveEncoding").value==="utf8";
    msg=ok ? "requirements.txt quedó guardado con la extensión y codificación correctas."
           : "Revisá: requirements.txt, Todos los archivos (*.*) y UTF-8.";
  }

  if(type==="repo"){
    const form=$("#repoForm");
    if(!form || form.classList.contains("hidden")){
      ok=false;
      msg="Primero debés hacer clic en + y luego en New repository.";
    }else{
      const vis=document.querySelector('input[name="visibility"]:checked')?.value;
      ok=$("#repoName").value.trim().toLowerCase()===p.repo &&
         vis==="public" &&
         $("#readme").checked &&
         $("#gitignore").value==="none" &&
         $("#license").value==="none";
      msg=ok ? "El repositorio quedó configurado correctamente."
             : `Usá ${p.repo}, visibilidad Public, marcá README y dejá .gitignore y License en None.`;
    }
  }

  if(type==="upload"){
    const panel=$("#uploadPanel");
    if(!panel || panel.classList.contains("hidden")){
      ok=false;
      msg="Primero abrí Add file y elegí Upload files.";
    }else{
      const commit=$("#commitMsg").value.trim();
      ok=$("#fileApp").checked && $("#fileReq").checked && !$("#fileExtra").checked && commit.length>=8;
      msg=ok ? "Los dos archivos correctos están listos para quedar en la raíz del repositorio y el commit tiene un mensaje válido."
             : "Seleccioná app.py y requirements.txt, no agregués la carpeta extra y escribí un mensaje de commit claro.";
    }
  }

  if(type==="deploy"){
    const form=$("#deployForm");
    if(!form || form.classList.contains("hidden")){
      ok=false;
      msg="Primero hacé clic en Create app y después en Yup, I have an app.";
    }else{
      const repo=$("#stRepo").value.trim().toLowerCase();
      const branch=$("#stBranch").value.trim().toLowerCase();
      const main=$("#stMain").value.trim().toLowerCase();
      ok=(repo.endsWith("/"+p.repo) || repo===p.repo) && branch==="main" && main==="app.py";
      msg=ok ? "La configuración de Streamlit está lista: repositorio correcto, rama main y app.py como archivo principal."
             : `Revisá Repository (${p.repo}), Branch = main y Main file path = app.py.`;
    }
  }

  if(type==="test"){
    ok=state.testPassed;
    msg=ok ? "La aplicación respondió correctamente. Proyecto completado."
           : "Primero utilizá la aplicación de prueba y comprobá que genere un resultado.";
  }

  if(ok){
    if(attempt===1) state.firstTry++;
    success(msg);
  }else{
    state.errors++;
    $("#hudErrors").textContent=state.errors;
    fail(msg);
  }
}

function success(msg){
  $("#feedback").className="feedback ok";
  $("#feedback").innerHTML=`<b>✓ PASO CORRECTO</b>${escaped(msg).replace(/\n/g,"<br>")}`;
  $("#checkBtn").classList.add("hidden");
  $("#nextBtn").classList.remove("hidden");
}

function fail(msg){
  $("#feedback").className="feedback bad";
  $("#feedback").innerHTML=`<b>REVISÁ ESTE PASO</b>${escaped(msg).replace(/\n/g,"<br>")}`;
}

function next(){
  state.done++;
  $("#hudDone").textContent=state.done;

  if(state.step < 7){
    state.step++;
    render();
    return;
  }

  if(state.project < 2){
    state.project++;
    state.step=0;
    render();
    return;
  }

  finish();
}

function finish(){
  clearInterval(state.timerId);
  state.seconds=Math.floor((Date.now()-state.start)/1000);
  $("#hud").classList.add("hidden");
  show("results");
  $("#resultName").textContent=state.name;
  $("#finalScore").textContent="24/24";
  $("#finalTime").textContent=fmt(state.seconds);
  $("#firstTry").textContent=state.firstTry;
  $("#totalErrors").textContent=state.errors;

  const best=JSON.parse(localStorage.getItem("pa_lab3_best")||"null");
  let msg="";
  if(!best || state.errors<best.errors || (state.errors===best.errors && state.seconds<best.time)){
    localStorage.setItem("pa_lab3_best",JSON.stringify({errors:state.errors,time:state.seconds,name:state.name}));
    msg="★ NUEVO MEJOR RESULTADO PERSONAL";
  }else{
    msg=`Mejor registro: ${best.errors} correcciones · ${fmt(best.time)}`;
  }
  $("#recordMessage").textContent=msg;
  loadRecords();
}

function loadRecords(){
  const b=JSON.parse(localStorage.getItem("pa_lab3_best")||"null");
  $("#records").textContent=b
    ? `Mejor intento guardado en este dispositivo: ${b.errors} correcciones · ${fmt(b.time)}`
    : "Aún no hay intentos guardados en este dispositivo.";
}

$("#startBtn").onclick=start;
$("#checkBtn").onclick=validate;
$("#nextBtn").onclick=next;
$("#restartBtn").onclick=()=>{show("welcome");loadRecords()};
loadRecords();
