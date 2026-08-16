"use strict";

const PAGE_SIZE = 30;
let catalogo = [];
let resultados = [];
let limite = PAGE_SIZE;

const search = document.querySelector("#search");
const section = document.querySelector("#resultsSection");
const grid = document.querySelector("#grid");
const empty = document.querySelector("#empty");
const count = document.querySelector("#resultCount");
const queryLabel = document.querySelector("#queryLabel");
const more = document.querySelector("#more");

const normalizar = (texto = "") =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function escapar(texto = "") {
  const span = document.createElement("span");
  span.textContent = texto;
  return span.innerHTML;
}

function pesquisar() {
  const consulta = search.value.trim();
  if (!consulta) {
    section.hidden = true;
    grid.innerHTML = "";
    return;
  }

  const palavras = normalizar(consulta).split(/\s+/).filter(Boolean);
  resultados = catalogo.filter((plano) => {
    const texto = normalizar([
      plano.numero, plano.descricao, plano.indice, plano.tensao,
      plano.catenaria, plano.aplicacao, plano.dossier
    ].join(" "));
    return palavras.every((palavra) => texto.includes(palavra));
  });

  limite = PAGE_SIZE;
  section.hidden = false;
  queryLabel.textContent = consulta;
  renderizar();
}

function renderizar() {
  count.textContent = `${resultados.length.toLocaleString("pt-PT")} ${resultados.length === 1 ? "resultado" : "resultados"}`;
  empty.hidden = resultados.length !== 0;
  grid.innerHTML = resultados.slice(0, limite).map((plano) => `
    <article class="card">
      <div class="card-top">
        <div><span class="number-label">PLANO</span><h3>${escapar(plano.numero)}</h3></div>
        ${plano.indice ? `<span class="index">${escapar(plano.indice)}</span>` : ""}
      </div>
      <p class="description">${escapar(plano.descricao || "Descrição não indicada")}</p>
      <div class="meta">
        ${plano.tensao ? `<span>${escapar(plano.tensao)}</span>` : ""}
        ${plano.catenaria ? `<span>${escapar(plano.catenaria)}</span>` : ""}
      </div>
      <a class="open" href="${escapar(plano.link)}" target="_blank" rel="noopener noreferrer">Abrir plano <span>↗</span></a>
    </article>
  `).join("");
  more.hidden = limite >= resultados.length;
}

search.addEventListener("input", pesquisar);
more.addEventListener("click", () => { limite += PAGE_SIZE; renderizar(); });
document.querySelectorAll("[data-query]").forEach((button) => button.addEventListener("click", () => {
  search.value = button.dataset.query; search.focus(); pesquisar();
}));
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault(); search.focus();
  }
});

fetch("catalogo.json")
  .then((response) => {
    if (!response.ok) throw new Error("Não foi possível carregar o catálogo.");
    return response.json();
  })
  .then((dados) => {
    catalogo = dados;
    document.querySelector("#total").textContent = `Catálogo técnico · ${catalogo.length.toLocaleString("pt-PT")} registos`;
  })
  .catch(() => {
    search.placeholder = "Erro ao carregar o catálogo";
    search.disabled = true;
  });
