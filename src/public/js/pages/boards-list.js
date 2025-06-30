// boards-list.js - Lógica para busca de projetos em tempo real

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchInput");
  const projectsContainer = document.querySelector(".row:last-child");
  let searchTimeout;

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      const query = this.value.trim();

      // Debounce - aguarda 500ms após parar de digitar
      searchTimeout = setTimeout(() => {
        if (query.length >= 2 || query.length === 0) {
          performSearch(query);
        }
      }, 500);
    });
  }

  function performSearch(query) {
    const url = `/admin/board/search?q=${encodeURIComponent(query)}`;

    fetch(url, {
      headers: {
        "X-Requested-With": "XMLHttpRequest",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          updateProjectsList(data.projects);
        }
      })
      .catch((error) => {
        console.error("Erro na busca:", error);
      });
  }

  function updateProjectsList(projects) {
    if (projects.length === 0) {
      projectsContainer.innerHTML = `
        <div class="col-12">
          <div class="box text-center">
            <div class="py-4">
              <i class="bx bx-search fs-1 text-muted d-block mb-3"></i>
              <h5 class="text-muted">Nenhum projeto encontrado</h5>
              <p class="text-muted mb-3">Não encontramos projetos com este termo. Tente outro termo de busca.</p>
              <a href="/admin/project/create" class="btn btn-primary">
                <i class="bx bx-plus"></i> Criar Primeiro Projeto
              </a>
            </div>
          </div>
        </div>
      `;
    } else {
      let html = "";
      projects.forEach((project) => {
        html += `
          <div class="col-lg-4 col-md-6">
            <div class="box h-100">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <h5 class="mb-0">${project.project_title}</h5>
                <span class="badge bg-primary">${project.total_cards}</span>
              </div>
              
              <div class="mb-3">
                <p class="text-muted mb-1 small">
                  <i class="bx bx-hash text-primary"></i> 
                  ID: ${project.project_id}
                </p>
                <p class="text-muted mb-1 small">
                  <i class="bx bx-user text-primary"></i> 
                  Cliente: ${project.client || 'N/A'}
                </p>
                <p class="text-muted mb-0 small">
                  <i class="bx bx-layer text-primary"></i> 
                  Cards: ${project.total_cards}
                </p>
              </div>

              <div class="d-grid">
                <a href="/admin/board/${project.id}" class="btn btn-primary">
                  <i class="bx bx-layout"></i> Abrir Board
                </a>
              </div>
            </div>
          </div>
        `;
      });
      projectsContainer.innerHTML = html;
    }
  }
});
