<template>
  <div class="container-fluid">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-1 small">
            <li class="breadcrumb-item">
              <a href="#" @click.prevent="$router.push({name: 'admin-convocatorias-categorias'})" class="text-decoration-none text-muted">Categorías</a>
            </li>
            <li class="breadcrumb-item">
              <a href="#" @click.prevent="$router.back()" class="text-decoration-none text-muted">{{ categoriaNombre || 'Programas' }}</a>
            </li>
            <li class="breadcrumb-item active text-primary fw-bold" aria-current="page">{{ programaNombre || 'Modalidades' }}</li>
          </ol>
        </nav>
        <h4 class="mb-0 fw-bold text-dark">Modalidades del Programa</h4>
        <small class="text-secondary">
          Gestiona las modalidades y sus convocatorias
        </small>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm px-3" @click="$router.back()">
            <i class="bi bi-arrow-left me-1"></i> Volver
        </button>
        <button class="btn btn-primary btn-sm px-3 fw-bold shadow-sm" @click="openModalityModal()">
            <i class="bi bi-plus-lg me-1"></i> Nueva Modalidad
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="d-flex justify-content-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="alert alert-danger shadow-sm border-0">
      <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="modalidades.length === 0" class="text-center py-5 bg-white rounded-3 shadow-sm">
      <div class="mb-3 text-secondary opacity-25">
        <i class="bi bi-diagram-3" style="font-size: 3rem;"></i>
      </div>
      <h5 class="text-secondary fw-bold">No hay modalidades disponibles</h5>
      <p class="text-muted small">Agrega una modalidad para comenzar.</p>
      <button class="btn btn-primary btn-sm mt-2" @click="openModalityModal()">
        Crear Modalidad
      </button>
    </div>

    <!-- List -->
    <div v-else class="row g-4">
      <div class="col-12 col-md-6 col-lg-4" v-for="mod in modalidades" :key="mod.idModalidad">
        <div 
          class="card h-100 border-0 shadow-sm hover-card"
        >
          <div class="card-body p-4 cursor-pointer" @click="openConvocatoriaModal(mod)">
            <div class="d-flex align-items-center mb-3">
              <div class="icon-box bg-success-subtle text-success rounded-circle p-3 me-3">
                <i class="bi bi-bezier2 fs-4"></i>
              </div>
              <div class="flex-grow-1">
                 <small class="text-muted d-block uppercase-text" style="font-size: 0.7rem;">MODALIDAD</small>
                 <h5 class="fw-bold text-dark mb-0">{{ mod.nombreModalidad }}</h5>
                 <small v-if="mod.numeroModalidad" class="text-secondary badge bg-light border">{{ mod.numeroModalidad }}</small>
              </div>
            </div>
            
            <p class="text-secondary small mb-3 line-clamp-3" v-if="mod.descripcionModalidad">
                {{ mod.descripcionModalidad }}
            </p>

            <div v-if="mod.caracteristicasEspecificas" class="mb-3 p-2 bg-light rounded-3 border border-light">
              <small class="text-muted d-block mb-1 fw-bold" style="font-size:0.7rem">CARACTERÍSTICAS</small>
              <!-- Si es objeto (JSON parseado) -->
              <ul class="ps-3 mb-0 small text-secondary" v-if="typeof mod.caracteristicasEspecificas === 'object'">
                <li v-for="(val, key) in Object.entries(mod.caracteristicasEspecificas).slice(0,3)" :key="key">
                    <span class="fw-medium">{{ key[0] }}:</span> {{ val[1] }}
                </li>
              </ul>
               <!-- Si es string -->
               <p v-else class="small text-secondary mb-0 line-clamp-2">{{ mod.caracteristicasEspecificas }}</p>
            </div>
          </div>
          <div class="card-footer bg-white border-0 pt-0 pb-3 px-4 d-flex justify-content-between align-items-center">
            <button class="btn btn-sm btn-outline-secondary p-1 px-2" @click.stop="openModalityModal(mod)" title="Editar Modalidad">
                <i class="bi bi-pencil"></i> Editar
            </button>
            <button class="btn btn-sm btn-primary-subtle text-primary fw-bold" @click.stop="openConvocatoriaModal(mod)">
                <i class="bi bi-file-earmark-text me-1"></i> Convocatoria
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= MODAL DE MODALIDAD (CREATE/EDIT) ================= -->
    <div v-if="showModalityModal" class="modal-backdrop fade show" style="z-index: 1050;"></div>
    <div v-if="showModalityModal" class="modal fade show d-block" tabindex="-1" role="dialog" style="z-index: 1055;" @click.self="closeModalityModal">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header border-bottom-0 pt-4 px-4">
            <h5 class="modal-title fw-bold text-agro-navy">
              {{ isEditingModality ? 'Editar Modalidad' : 'Nueva Modalidad' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModalityModal"></button>
          </div>
          <div class="modal-body p-4">
             <form @submit.prevent="submitModalityForm">
                <div class="mb-3">
                    <label class="form-label small fw-bold text-secondary">Nombre de la Modalidad <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" v-model="modalityForm.nombreModalidad" required maxlength="200">
                </div>
                <div class="mb-3">
                    <label class="form-label small fw-bold text-secondary">Número / Identificador</label>
                    <input type="text" class="form-control" v-model="modalityForm.numeroModalidad" placeholder="Ej. MOD-001" maxlength="20">
                </div>
                <div class="mb-3">
                    <label class="form-label small fw-bold text-secondary">Descripción</label>
                    <textarea class="form-control" v-model="modalityForm.descripcionModalidad" rows="3"></textarea>
                </div>
                <div class="mb-3">
                    <label class="form-label small fw-bold text-secondary">Características Específicas (JSON)</label>
                    <textarea class="form-control font-monospace small" v-model="modalityForm.caracteristicasEspecificas" rows="4" placeholder='{"clave": "valor"}'></textarea>
                    <div class="form-text">Ingresa un JSON válido o texto libre.</div>
                </div>

                <div v-if="modalityFormError" class="alert alert-danger small py-2">
                    {{ modalityFormError }}
                </div>

                <div class="d-flex justify-content-end gap-2 mt-4">
                    <button type="button" class="btn btn-light" @click="closeModalityModal">Cancelar</button>
                    <button type="submit" class="btn btn-primary px-4 fw-bold" :disabled="modalityFormLoading">
                        <span v-if="modalityFormLoading" class="spinner-border spinner-border-sm me-1"></span>
                        Guardar
                    </button>
                </div>
             </form>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= MODAL DE CONVOCATORIA (VIEW/EDIT/CREATE) ================= -->
    <div v-if="showConvModal" class="modal-backdrop fade show" style="z-index: 1060;"></div>
    <div v-if="showConvModal" class="modal fade show d-block" tabindex="-1" role="dialog" style="z-index: 1065;" @click.self="closeConvModal">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4">
          
          <div class="modal-header border-bottom-0 pt-4 px-4 bg-light bg-opacity-10">
            <div>
                 <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-1 rounded-pill mb-2">
                  {{ activeModality?.nombreModalidad || 'Convocatoria' }}
                </span>
                <h4 class="modal-title fw-bold text-agro-navy">
                  {{ convData ? (isEditingConv ? 'Editar Convocatoria' : convData.nombreConvocatoria) : 'Crear Convocatoria' }}
                </h4>
            </div>
            <button type="button" class="btn-close" @click="closeConvModal"></button>
          </div>

          <div class="modal-body p-4">
            <!-- Loading -->
            <div v-if="convLoading" class="d-flex justify-content-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
            </div>

            <!-- Create / Edit Form -->
             <div v-else-if="!convData || isEditingConv">
                <form @submit.prevent="submitConvForm">
                    <div class="alert alert-info small border-0 shadow-sm mb-4">
                        <i class="bi bi-info-circle-fill me-2"></i> Puedes guardar la convocatoria parcialmente. El estatus se mantendrá "Cerrada" hasta que completes la información.
                    </div>
                    
                    <div class="row g-4">
                        <!-- Sección 1: Datos Generales -->
                        <div class="col-12"><h6 class="text-primary fw-bold mb-0 border-bottom pb-2">1. Informacion General</h6></div>
                        
                        <div class="col-md-8">
                            <label class="form-label small fw-bold text-secondary">Nombre Convocatoria <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" v-model="convForm.nombreConvocatoria" required>
                        </div>
                        <div class="col-md-4">
                             <label class="form-label small fw-bold text-secondary">Número Convocatoria</label>
                             <select class="form-select" v-model="convForm.numeroConvocatoria">
                                <option value="">Seleccione...</option>
                                <option value="Primera">Primera</option>
                                <option value="Segunda">Segunda</option>
                                <option value="Tercera">Tercera</option>
                                <option value="Cuarta">Cuarta</option>
                                <option value="Extraordinaria">Extraordinaria</option>
                             </select>
                        </div>
                         <div class="col-12">
                            <label class="form-label small fw-bold text-secondary">Descripción General</label>
                             <textarea class="form-control" v-model="convForm.descripcionConvocatoria" rows="3"></textarea>
                        </div>
                        <div class="col-12">
                             <label class="form-label small fw-bold text-secondary">Objetivo General</label>
                             <textarea class="form-control" v-model="convForm.objetivoGeneral" rows="3"></textarea>
                        </div>
                         <div class="col-12">
                             <label class="form-label small fw-bold text-secondary">Población Objetivo</label>
                             <textarea class="form-control" v-model="convForm.poblacionObjetivo" rows="3"></textarea>
                        </div>

                         <!-- Sección 2: Fechas y Estatus -->
                        <div class="col-12 mt-4"><h6 class="text-primary fw-bold mb-0 border-bottom pb-2">2. Temporalidad y Estatus</h6></div>
                        
                        <div class="col-md-4">
                            <label class="form-label small fw-bold text-secondary">Fecha Inicio</label>
                            <input type="date" class="form-control" v-model="convForm.fechaInicio">
                        </div>
                         <div class="col-md-4">
                            <label class="form-label small fw-bold text-secondary">Fecha Cierre</label>
                            <input type="date" class="form-control" v-model="convForm.fechaCierre">
                        </div>
                         <div class="col-md-4">
                            <label class="form-label small fw-bold text-secondary">Fecha Diagnóstico</label>
                            <input type="date" class="form-control" v-model="convForm.fechaDiagnostico">
                        </div>
                         <div class="col-md-6">
                             <label class="form-label small fw-bold text-secondary">Estatus</label>
                             <select class="form-select" v-model="convForm.estatus">
                                <option value="Abierta">Abierta (Visible para usuarios)</option>
                                <option value="Cerrada">Cerrada (Borrador)</option>
                                <option value="En proceso">En proceso</option>
                             </select>
                             <div class="form-text small text-muted" v-if="!canPublish">* Completa todos los campos para abrir la convocatoria.</div>
                        </div>

                        <!-- Sección 3: Monto y Apoyo -->
                         <div class="col-12 mt-4"><h6 class="text-primary fw-bold mb-0 border-bottom pb-2">3. Monto de Apoyo</h6></div>
                         <div class="col-md-4">
                            <label class="form-label small fw-bold text-secondary">Monto (MXN)</label>
                            <div class="input-group">
                                <span class="input-group-text">$</span>
                                <input type="number" step="0.01" class="form-control" v-model="convForm.monto">
                            </div>
                        </div>
                        <div class="col-md-8">
                             <label class="form-label small fw-bold text-secondary">Descripción del Apoyo</label>
                             <textarea class="form-control" v-model="convForm.descripcionMontoApoyo" rows="2" placeholder="Describa en qué consiste el apoyo..."></textarea>
                        </div>

                        <!-- Sección 4: Criterios de Elegibilidad -->
                         <div class="col-12 mt-4"><h6 class="text-primary fw-bold mb-0 border-bottom pb-2">4. Criterios de Elegibilidad</h6></div>
                         <div class="col-md-6">
                             <label class="form-label small fw-bold text-secondary">Criterios Generales</label>
                             <textarea class="form-control" v-model="convForm.criteriosGenerales" rows="4" placeholder="Lista de criterios generales..."></textarea>
                        </div>
                         <div class="col-md-6">
                             <label class="form-label small fw-bold text-secondary">Criterios Específicos</label>
                             <textarea class="form-control" v-model="convForm.criteriosEspecificos" rows="4" placeholder="Lista de criterios específicos..."></textarea>
                        </div>

                        <!-- Sección 5: Proceso y Resultados -->
                         <div class="col-12 mt-4"><h6 class="text-primary fw-bold mb-0 border-bottom pb-2">5. Proceso, Resultados e Informes</h6></div>
                         <div class="col-12">
                             <label class="form-label small fw-bold text-secondary">Proceso de Registro</label>
                             <textarea class="form-control" v-model="convForm.procesoRegistro" rows="3" placeholder="Instrucciones para el registro..."></textarea>
                        </div>
                        <div class="col-12">
                             <label class="form-label small fw-bold text-secondary">Publicación de Resultados</label>
                             <textarea class="form-control" v-model="convForm.publicacionResultados" rows="2" placeholder="Cómo y cuándo se publicarán..."></textarea>
                        </div>
                         <div class="col-md-6">
                            <label class="form-label small fw-bold text-secondary">URL Resultados</label>
                            <input type="url" class="form-control" v-model="convForm.urlPublicacionResultados" placeholder="https://...">
                        </div>
                         <div class="col-md-6">
                            <label class="form-label small fw-bold text-secondary">Días para Publicación</label>
                            <input type="number" class="form-control" v-model="convForm.diasPublicacionResultados" placeholder="Ej. 15">
                        </div>
                        <div class="col-12">
                             <label class="form-label small fw-bold text-secondary">Informes / Contacto</label>
                             <textarea class="form-control" v-model="convForm.informes" rows="2"></textarea>
                        </div>
                        <div class="col-12">
                            <label class="form-label small fw-bold text-secondary">URL Convocatoria Oficial</label>
                            <input type="url" class="form-control" v-model="convForm.urlConvocatoria" placeholder="Link al documento oficial PDF">
                        </div>

                         <!-- Sección 6: Requisitos -->
                         <div class="col-12 mt-4"><h6 class="text-primary fw-bold mb-0 border-bottom pb-2">6. Requisitos (Documentos)</h6></div>
                         <div class="col-12">
                             <div class="bg-light p-3 rounded-3 border">
                                 <div class="d-flex justify-content-between align-items-center mb-3">
                                    <label class="form-label small fw-bold text-secondary mb-0">Documentos Solicitados</label>
                                    <button type="button" class="btn btn-sm btn-outline-primary fw-bold" @click="openReqManager">
                                        <i class="bi bi-plus-lg me-1"></i> Gestionar Requisitos
                                    </button>
                                 </div>

                                 <!-- Selected Reqs List (Preview) -->
                                 <div v-if="convForm.requisitos.length === 0" class="text-center text-muted small py-3">
                                     No hay requisitos seleccionados. Haz clic en "Gestionar Requisitos" para agregar.
                                 </div>
                                 <ul v-else class="list-group">
                                     <li class="list-group-item d-flex align-items-center justify-content-between p-2" v-for="(req, idx) in convForm.requisitos" :key="idx">
                                         <div class="d-flex align-items-center gap-2">
                                             <span class="fw-medium small">{{ req.nombre }}</span>
                                             <span class="badge bg-light text-secondary border" v-if="req.es_vigencia_temporal">Temporal</span>
                                         </div>
                                         <div class="d-flex align-items-center gap-3">
                                             <div class="form-check form-switch small mb-0">
                                                <input class="form-check-input" type="checkbox" v-model="req.obligatorio" :id="'req-obl-'+idx">
                                                <label class="form-check-label small text-muted" :for="'req-obl-'+idx">Obligatorio</label>
                                            </div>
                                             <button type="button" class="btn btn-sm text-danger" @click="removeRequirement(idx)">
                                                 <i class="bi bi-trash"></i>
                                             </button>
                                         </div>
                                     </li>
                                 </ul>
                             </div>
                        </div>

                        <!-- Sección 7: Cobertura Geográfica -->
                        <div class="col-12 mt-4"><h6 class="text-primary fw-bold mb-0 border-bottom pb-2">7. Cobertura Geográfica</h6></div>
                        <div class="col-12">
                             <div class="d-flex gap-4 mb-3">
                                 <div class="form-check">
                                    <input class="form-check-input" type="radio" name="cobertura" id="cob-estatal" value="estatal" v-model="coverageType">
                                    <label class="form-check-label fw-bold" for="cob-estatal">
                                        Nivel Estatal (Todos los municipios)
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="cobertura" id="cob-mun" value="municipal" v-model="coverageType">
                                    <label class="form-check-label fw-bold" for="cob-mun">
                                        Municipios Específicos
                                    </label>
                                </div>
                             </div>

                             <div v-if="coverageType === 'municipal'" class="bg-light p-3 rounded-3 border">
                                 <div class="row g-2">
                                     <div class="col-md-4 col-sm-6" v-for="mun in allMunicipios" :key="mun.idMunicipio">
                                         <div class="form-check">
                                            <input class="form-check-input" type="checkbox" :value="mun.idMunicipio" v-model="selectedMunicipios" :id="'mun-'+mun.idMunicipio">
                                            <label class="form-check-label small" :for="'mun-'+mun.idMunicipio">
                                                {{ mun.nombreMunicipio }}
                                            </label>
                                        </div>
                                     </div>
                                 </div>
                                 <div v-if="selectedMunicipios.length === 0" class="text-danger small mt-2">
                                     * Selecciona al menos un municipio.
                                 </div>
                             </div>
                        </div>

                    </div>

                     <div v-if="convFormError" class="alert alert-danger small py-2 mt-3">
                        {{ convFormError }}
                    </div>

                    <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top sticky-bottom bg-white pb-3">
                        <button type="button" class="btn btn-light" @click="cancelConvEdit">Cancelar</button>
                        <button type="submit" class="btn btn-primary px-4 fw-bold">
                             <span v-if="convFormLoading" class="spinner-border spinner-border-sm me-1"></span>
                            {{ convData ? 'Guardar Todo' : 'Crear Convocatoria' }}
                        </button>
                    </div>
                </form>
             </div>

            <!-- View Details -->
            <div v-else>
                 <div class="card border-0 shadow-sm mb-4 rounded-4 bg-light bg-opacity-25">
                     <div class="card-body">
                         <div class="d-flex justify-content-between align-items-start mb-3">
                             <h5 class="fw-bold mb-0">{{ convData.nombreConvocatoria }}</h5>
                             <span class="badge" :class="convData.estatus === 'Abierta' ? 'bg-success' : 'bg-secondary'">
                                {{ convData.estatus }}
                             </span>
                         </div>
                         <p class="text-secondary mb-3">{{ convData.descripcionConvocatoria || 'Sin descripción.' }}</p>
                          <div class="d-flex gap-3 flex-wrap">
                            <span class="badge bg-white text-dark border">
                                <i class="bi bi-calendar-event me-1"></i> Vigencia: {{ convData.fechaInicio }} - {{ convData.fechaCierre }}
                            </span>
                             <span class="badge bg-white text-dark border" v-if="convData.monto">
                                <i class="bi bi-currency-dollar me-1"></i> Apoyo: ${{ Number(convData.monto).toLocaleString() }}
                            </span>
                          </div>
                     </div>
                 </div>
                 
                 <div class="row g-4">
                     <div class="col-md-6">
                         <h6 class="fw-bold border-bottom pb-2">Objetivo</h6>
                         <p class="text-muted small">{{ convData.objetivoGeneral || '—' }}</p>
                     </div>
                     <div class="col-md-6">
                         <h6 class="fw-bold border-bottom pb-2">Población Objetivo</h6>
                         <p class="text-muted small">{{ convData.poblacionObjetivo || '—' }}</p>
                     </div>
                     <div class="col-md-12" v-if="convData.requisitos && convData.requisitos.length">
                         <h6 class="fw-bold border-bottom pb-2">Requisitos</h6>
                         <ul class="list-group list-group-flush">
                             <li class="list-group-item bg-transparent px-0 py-1 small" v-for="r in convData.requisitos" :key="r.idTipoDocumento || r.id">
                                 <i class="bi bi-check2-circle text-success me-2"></i> {{ r.nombre }}
                             </li>
                         </ul>
                     </div>

                     <!-- Cobertura View -->
                     <div class="col-md-12 mt-2">
                         <h6 class="fw-bold border-bottom pb-2">Cobertura Geográfica</h6>
                         <p class="text-muted small">
                             <i class="bi bi-geo-alt-fill text-danger me-1"></i>
                             {{ convData.coberturaTexto || 'No especificada' }}
                         </p>
                     </div>

                 </div>

                 <!-- Botones de Acción View -->
                 <div class="mt-4 pt-3 border-top text-end">
                     <button class="btn btn-outline-primary btn-sm" @click="startConvEdit">
                         <i class="bi bi-pencil me-1"></i> Editar Información
                     </button>
                 </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- ================= MODAL DE GESTIÓN DE REQUISITOS ================= -->
    <div v-if="showReqManager" class="modal-backdrop fade show" style="z-index: 1070;"></div>
    <div v-if="showReqManager" class="modal fade show d-block" tabindex="-1" role="dialog" style="z-index: 1075;" @click.self="closeReqManager">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <div class="modal-header border-bottom-0 pt-3 px-4">
                 <h6 class="modal-title fw-bold text-agro-navy">Gestionar Requisitos</h6>
                 <button type="button" class="btn-close" @click="closeReqManager"></button>
            </div>
            <div class="modal-body p-4 pt-0">
                <div class="mb-3 position-relative">
                    <input type="text" class="form-control" placeholder="Buscar documento..." v-model="reqSearch" autofocus>
                    <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
                </div>
                
                <div class="list-group shadow-sm overflow-auto" style="max-height: 400px;">
                    <!-- Create New -->
                    <button v-if="reqSearch && !filteredReqList.find(r => r.nombre.toLowerCase() === reqSearch.toLowerCase())" 
                        class="list-group-item list-group-item-action text-primary fw-bold" 
                        @click="createNewReqType">
                        <i class="bi bi-plus-circle me-2"></i> Crear nuevo: "{{ reqSearch }}"
                    </button>

                    <!-- Items -->
                    <button type="button" 
                        class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        v-for="type in filteredReqList" 
                        :key="type.idTipoDocumento"
                        @click="toggleRequirement(type)"
                        :class="{'bg-primary-subtle': isSelected(type)}"
                    >
                        <div>
                             <i class="bi" :class="isSelected(type) ? 'bi-check-circle-fill text-primary' : 'bi-circle text-muted'"></i>
                             <span class="ms-2 fw-medium" :class="{'text-primary': isSelected(type)}">{{ type.nombre }}</span>
                             <span class="badge bg-light text-secondary border ms-2 small" v-if="type.es_vigencia_temporal">Temporal</span>
                        </div>
                        <span class="badge bg-primary rounded-pill" v-if="isSelected(type)">Seleccionado</span>
                    </button>

                    <div v-if="filteredReqList.length === 0 && !reqSearch" class="text-center py-4 text-muted">
                        <div class="spinner-border spinner-border-sm text-secondary" v-if="reqLoading"></div>
                        <span v-else>No hay documentos disponibles.</span>
                    </div>
                </div>
            </div>
            <div class="modal-footer border-top-0 pt-0 px-4 pb-3">
                <button type="button" class="btn btn-primary fw-bold w-100" @click="closeReqManager">Listo</button>
            </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
    fetchModalidadesByPrograma, 
    fetchConvocatoriaDetalle, 
    fetchRequisitosConvocatoria,
    fetchMunicipios,
    fetchConvocatoriaCobertura,
    saveConvocatoriaCobertura,
    createModalidad, 
    updateModalidad,
    createConvocatoria, 
    updateConvocatoria, 
    saveRequisitos,
    fetchTiposDocumentos, 
    createTipoDocumento 
} from '@/services/convocatorias.api'

const route = useRoute()
const router = useRouter()

const idPrograma = computed(() => Number(route.params.idPrograma))
const programaNombre = computed(() => route.query?.nombrePrograma || '')
const categoriaNombre = computed(() => route.query?.categoria || '')

const loading = ref(true)
const error = ref('')
const modalidades = ref([])

const allMunicipios = ref([])
const selectedMunicipios = ref([]) // Array of IDs
const coverageType = ref('estatal') // 'estatal' | 'municipal'

// --- STATE: MODALITY MODAL ---
const showModalityModal = ref(false)
const modalityFormLoading = ref(false)
const modalityFormError = ref(null)
const isEditingModality = ref(false)
const editingModalityId = ref(null)
const modalityForm = reactive({
    nombreModalidad: '',
    numeroModalidad: '',
    descripcionModalidad: '',
    caracteristicasEspecificas: ''
})

// --- STATE: CONVOCATORIA MODAL ---
const showConvModal = ref(false)
const convLoading = ref(false)
const convData = ref(null)
const convFormError = ref(null)
const convFormLoading = ref(false)
const isEditingConv = ref(false)
const activeModality = ref(null) 
const canPublish = ref(false)

const convForm = reactive({
    nombreConvocatoria: '',
    numeroConvocatoria: '',
    descripcionConvocatoria: '',
    estatus: 'Cerrada',
    fechaInicio: '',
    fechaCierre: '',
    fechaDiagnostico: '',
    objetivoGeneral: '',
    poblacionObjetivo: '',
    monto: '',
    descripcionMontoApoyo: '',
    criteriosGenerales: '',
    criteriosEspecificos: '',
    procesoRegistro: '',
    publicacionResultados: '',
    urlPublicacionResultados: '',
    diasPublicacionResultados: '',
    informes: '',
    urlConvocatoria: '',
    requisitos: [] // Array of { idTipoDocumento, nombre, obligatorio: true/false }
})

// --- STATE: REQUISITOS MANAGER ---
const showReqManager = ref(false)
const reqLoading = ref(false)
const reqTypes = ref([])
const reqSearch = ref('')

// Computed to sort and filter requirements
const filteredReqList = computed(() => {
    let list = [...reqTypes.value]
    
    // Filter
    if (reqSearch.value) {
        const term = reqSearch.value.toLowerCase()
        list = list.filter(t => t.nombre.toLowerCase().includes(term))
    }

    // Sort: Selected first
    list.sort((a, b) => {
        const aSel = isSelected(a)
        const bSel = isSelected(b)
        if (aSel && !bSel) return -1
        if (!aSel && bSel) return 1
        return a.nombre.localeCompare(b.nombre)
    })
    
    return list
})

const isSelected = (type) => {
    return convForm.requisitos.some(r => r.idTipoDocumento === type.idTipoDocumento)
}


// --- LOAD DATA ---
const loadMunicipios = async () => {
    try {
        const res = await fetchMunicipios()
        if (Array.isArray(res) && res.length > 0) {
             allMunicipios.value = res
        } else if (res.data && Array.isArray(res.data) && res.data.length > 0) {
             allMunicipios.value = res.data
        } else {
             useMunicipiosFallback()
        }
    } catch (e) {
        console.warn("Error fetching municipios, using fallback", e)
        useMunicipiosFallback()
    }
}

const useMunicipiosFallback = () => {
    allMunicipios.value = [
        { idMunicipio: 1, nombreMunicipio: "Cozumel" },
        { idMunicipio: 2, nombreMunicipio: "Felipe Carrillo Puerto" },
        { idMunicipio: 3, nombreMunicipio: "Isla Mujeres" },
        { idMunicipio: 4, nombreMunicipio: "Othón P. Blanco" },
        { idMunicipio: 5, nombreMunicipio: "José María Morelos" },
        { idMunicipio: 6, nombreMunicipio: "Lázaro Cárdenas" },
        { idMunicipio: 7, nombreMunicipio: "Solidaridad" },
        { idMunicipio: 8, nombreMunicipio: "Tulum" },
        { idMunicipio: 9, nombreMunicipio: "Bacalar" },
        { idMunicipio: 10, nombreMunicipio: "Puerto Morelos" },
        { idMunicipio: 11, nombreMunicipio: "Benito Juárez" }
    ]
}

const loadModalidades = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetchModalidadesByPrograma(idPrograma.value)
    modalidades.value = res.items || []
  } catch (e) {
    console.error(e)
    error.value = 'Error al cargar las modalidades.'
  } finally {
    loading.value = false
  }
}

// --- MODALITY LOGIC ---
const openModalityModal = (mod = null) => {
    showModalityModal.value = true
    modalityFormError.value = null
    if (mod) {
        isEditingModality.value = true
        editingModalityId.value = mod.idModalidad
        modalityForm.nombreModalidad = mod.nombreModalidad
        modalityForm.numeroModalidad = mod.numeroModalidad || ''
        modalityForm.descripcionModalidad = mod.descripcionModalidad || ''
        if (typeof mod.caracteristicasEspecificas === 'object') {
            modalityForm.caracteristicasEspecificas = JSON.stringify(mod.caracteristicasEspecificas, null, 2)
        } else {
             modalityForm.caracteristicasEspecificas = mod.caracteristicasEspecificas || ''
        }
    } else {
        isEditingModality.value = false
        editingModalityId.value = null
        modalityForm.nombreModalidad = ''
        modalityForm.numeroModalidad = ''
        modalityForm.descripcionModalidad = ''
        modalityForm.caracteristicasEspecificas = ''
    }
}

const closeModalityModal = () => {
    showModalityModal.value = false
}

const submitModalityForm = async () => {
    modalityFormLoading.value = true
    modalityFormError.value = null
    try {
        // Parse JSON if possible
        let specs = modalityForm.caracteristicasEspecificas;
        try {
            specs = JSON.parse(specs);
        } catch (e) {
            // Keep as string if not valid JSON
        }

        const payload = {
            idPrograma: idPrograma.value,
            nombreModalidad: modalityForm.nombreModalidad,
            numeroModalidad: modalityForm.numeroModalidad,
            descripcionModalidad: modalityForm.descripcionModalidad,
            caracteristicasEspecificas: specs
        }

        if (isEditingModality.value) {
            await updateModalidad(editingModalityId.value, payload)
        } else {
            // 1. Create Modality
            const newMod = await createModalidad(payload)
            
            // 2. Auto-create "Skeleton" Convocatoria to ensure key relationship
            if (newMod && newMod.idModalidad) {
                try {
                    await createConvocatoria({
                        idPrograma: idPrograma.value,
                        idModalidad: newMod.idModalidad,
                        nombreConvocatoria: 'Convocatoria ' + newMod.nombreModalidad,
                        estatus: 'Cerrada'
                    })
                } catch (convErr) {
                    console.warn("Warning: Could not auto-create convocatoria", convErr)
                }
            }
        }
        closeModalityModal()
        await loadModalidades()
    } catch (e) {
        console.error(e)
        modalityFormError.value = e?.response?.data?.message || 'Error al guardar modalidad.'
    } finally {
        modalityFormLoading.value = false
    }
}

// --- REQUISITOS LOGIC (NEW) ---
const openReqManager = async () => {
    showReqManager.value = true
    reqSearch.value = ''
    reqLoading.value = true
    try {
        const data = await fetchTiposDocumentos()
        reqTypes.value = Array.isArray(data) ? data : []
    } catch (e) {
        console.error("Error fetching doc types", e)
    } finally {
        reqLoading.value = false
    }
}

const closeReqManager = () => {
    showReqManager.value = false
}

const toggleRequirement = (type) => {
    const idx = convForm.requisitos.findIndex(r => r.idTipoDocumento === type.idTipoDocumento)
    if (idx >= 0) {
        // Remove
        convForm.requisitos.splice(idx, 1)
    } else {
        // Add
        convForm.requisitos.push({
            idTipoDocumento: type.idTipoDocumento,
            nombre: type.nombre,
            obligatorio: true,
            es_vigencia_temporal: type.es_vigencia_temporal
        })
    }
}

const createNewReqType = async () => {
    try {
        const newType = await createTipoDocumento({ nombre: reqSearch.value, es_vigencia_temporal: 0 })
        // Add to global list
        reqTypes.value.push(newType)
        // Select it automatically
        toggleRequirement(newType)
        // Clear search? Or keep it to see the new item?
        // reqSearch.value = ''
    } catch (e) {
        console.error("Error creating type", e)
    }
}

const removeRequirement = (index) => {
    convForm.requisitos.splice(index, 1)
}


// --- CONVOCATORIA LOGIC ---
const openConvocatoriaModal = async (mod) => {
    showConvModal.value = true
    activeModality.value = mod
    convLoading.value = true
    convData.value = null
    convFormError.value = null
    isEditingConv.value = false

    // Reset Form
    Object.keys(convForm).forEach(k => convForm[k] = '')
    convForm.requisitos = []
    convForm.estatus = 'Cerrada'

    // NOTE: We do NOT load Requisitos here anymore. Loaded on Demand.

    try {
        const targetId = mod.idConvocatoria || mod.idModalidad
        const res = await fetchConvocatoriaDetalle(targetId)
        if (res && res.idConvocatoria) {
            convData.value = res

            // Fetch Requirements
            try {
                const reqs = await fetchRequisitosConvocatoria(res.idConvocatoria)
                if (Array.isArray(reqs)) {
                    convData.value.requisitos = reqs.map(item => ({
                        idTipoDocumento: item.requisito.id,
                        nombre: item.requisito.nombre,
                        obligatorio: item.requisito.obligatorio,
                        es_vigencia_temporal: item.requisito.temporal
                    }))
                }
            } catch (reqErr) {
                console.warn("Error fetching requirements", reqErr)
            }

            // Populate View Cobertura Data
            if (res.cobertura && Array.isArray(res.cobertura) && res.cobertura.length > 0) {
                 convData.value.coberturaTexto = res.cobertura.map(m => m.nombreMunicipio).join(', ')
                 convData.value.hasSpecificCoverage = true
            } else {
                 convData.value.coberturaTexto = 'Nivel Estatal (Todos los municipios)'
                 convData.value.hasSpecificCoverage = false
            }

        } else {
            isEditingConv.value = true
            // Pre-fill fields that might come from Modality?
            convForm.nombreConvocatoria = "Convocatoria " + mod.nombreModalidad
        }
    } catch (e) {
        console.warn("No convocatoria found", e)
        isEditingConv.value = true
        convForm.nombreConvocatoria = "Convocatoria " + mod.nombreModalidad
    } finally {
        convLoading.value = false
    }
}

const closeConvModal = () => {
    showConvModal.value = false
}

const startConvEdit = () => {
    isEditingConv.value = true
    if (convData.value) {
        // Map fields
        convForm.nombreConvocatoria = convData.value.nombreConvocatoria
        convForm.numeroConvocatoria = convData.value.numeroConvocatoria || ''
        convForm.descripcionConvocatoria = convData.value.descripcionConvocatoria || ''
        convForm.estatus = convData.value.estatus || 'Cerrada' // Strict default
        convForm.fechaInicio = convData.value.fechaInicio || ''
        convForm.fechaCierre = convData.value.fechaCierre || ''
        convForm.fechaDiagnostico = convData.value.fechaDiagnostico || ''
        convForm.objetivoGeneral = convData.value.objetivoGeneral || ''
        convForm.poblacionObjetivo = convData.value.poblacionObjetivo || ''
        convForm.monto = convData.value.monto || ''
        convForm.descripcionMontoApoyo = convData.value.descripcionMontoApoyo || '' // If exists in DB?
        
        convForm.procesoRegistro = convData.value.procesoRegistro || ''
        convForm.publicacionResultados = convData.value.publicacionResultados || ''
        convForm.urlPublicacionResultados = convData.value.urlPublicacionResultados || ''
        convForm.diasPublicacionResultados = convData.value.diasPublicacionResultados || ''
        convForm.informes = convData.value.informes || ''
        convForm.urlConvocatoria = convData.value.urlConvocatoria || ''

        // Criterios (JSON) logic
        // Assuming database stores JSON or standard structure.
        // User requested: "se guarda como array en dicho campo" -> "criteriosElegibilidad"
        // I'll try to parse it if it exists.
        if (typeof convData.value.criteriosElegibilidad === 'object') {
             convForm.criteriosGenerales = convData.value.criteriosElegibilidad.generales || ''
             convForm.criteriosEspecificos = convData.value.criteriosElegibilidad.especificos || ''
        } else {
             // If string, put in generic?
             convForm.criteriosGenerales = convData.value.criteriosElegibilidad || ''
        }

        // Requisitos
        if (convData.value.requisitos) {
            convForm.requisitos = convData.value.requisitos.map(r => ({
                idTipoDocumento: r.idTipoDocumento || r.id, // Adaptation
                nombre: r.nombre,
                obligatorio: r.pivot ? !!r.pivot.obligatorio : true,
                es_vigencia_temporal: r.es_vigencia_temporal
            }))
        }
        // Cobertura logic for Edit Mode
        const cobList = convData.value.cobertura
        if (cobList && Array.isArray(cobList) && cobList.length > 0) {
            coverageType.value = 'municipal'
            selectedMunicipios.value = cobList.map(m => m.idMunicipio)
        } else {
            coverageType.value = 'estatal'
            selectedMunicipios.value = []
        }
    }
}

const cancelConvEdit = () => {
    if (convData.value) {
        isEditingConv.value = false
    } else {
        closeConvModal()
    }
}

// Watcher to check status availability
watch(convForm, () => {
    // Check if critical fields are populated
    const required = ['nombreConvocatoria', 'descripcionConvocatoria', 'objetivoGeneral', 'fechaInicio', 'fechaCierre'];
    const isComplete = required.every(f => !!convForm[f]);
    canPublish.value = isComplete;
    if (!isComplete && convForm.estatus === 'Abierta') {
        convForm.estatus = 'Cerrada'; // Force closed
    }
}, { deep: true })

const submitConvForm = async () => {
    convFormLoading.value = true
    convFormError.value = null
    try {
        // Construct Payload
        const criteriosValues = {
            generales: convForm.criteriosGenerales,
            especificos: convForm.criteriosEspecificos
        }

        const payload = {
            idPrograma: idPrograma.value,
            idModalidad: activeModality.value.idModalidad,
            nombreConvocatoria: convForm.nombreConvocatoria,
            numeroConvocatoria: convForm.numeroConvocatoria,
            descripcionConvocatoria: convForm.descripcionConvocatoria,
            estatus: convForm.estatus,
            fechaInicio: convForm.fechaInicio,
            fechaCierre: convForm.fechaCierre,
            fechaDiagnostico: convForm.fechaDiagnostico,
            objetivoGeneral: convForm.objetivoGeneral,
            poblacionObjetivo: convForm.poblacionObjetivo,
            monto: convForm.monto,
            descripcionMontoApoyo: convForm.descripcionMontoApoyo, // Might need backend support
            criteriosElegibilidad: criteriosValues, // JSON Object
            procesoRegistro: convForm.procesoRegistro,
            publicacionResultados: convForm.publicacionResultados,
            urlPublicacionResultados: convForm.urlPublicacionResultados,
            diasPublicacionResultados: convForm.diasPublicacionResultados,
            informes: convForm.informes,
            urlConvocatoria: convForm.urlConvocatoria
        }

        let idConv = convData.value?.idConvocatoria

        if (idConv) {
            await updateConvocatoria(idConv, payload)
        } else {
            const res = await createConvocatoria(payload)
            idConv = res.idConvocatoria || res.id // Adaptation
        }
        
        // Save Requisitos
        const reqPayload = convForm.requisitos.map((r, i) => ({
            idTipoDocumento: r.idTipoDocumento,
            obligatorio: r.obligatorio,
            orden: i
        }))
        await saveRequisitos(idConv, reqPayload)
        
        // Save Cobertura
        let coberturaPayload = []
        if (coverageType.value === 'municipal') {
            coberturaPayload = selectedMunicipios.value
        } else {
             coberturaPayload = [] 
        }
        await saveConvocatoriaCobertura(idConv, coberturaPayload)

        closeConvModal()
        await loadModalidades() 

    } catch (e) {
        console.error(e)
        convFormError.value = e?.response?.data?.message || 'Error al guardar convocatoria.'
    } finally {
        convFormLoading.value = false
    }
}

onMounted(() => {
    loadModalidades()
    loadMunicipios()
})
</script>

<style scoped>
.hover-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
.hover-card:hover { transform: translateY(-5px); box-shadow: 0 1rem 3rem rgba(0,0,0,.1)!important; }
.uppercase-text { text-transform: uppercase; letter-spacing: 0.5px; }
.cursor-pointer { cursor: pointer; }
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
