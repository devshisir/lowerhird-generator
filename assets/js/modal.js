// for create modal
const createModal = document.getElementById('createProjectModal')
const projectNameInput = document.getElementById('projectName')

createModal.addEventListener('shown.bs.modal', () => {
  projectNameInput.focus()
})
createModal.addEventListener('hide.bs.modal', () => {
  projectNameInput.value = '';
})

// for rename modal
const renameModal = document.getElementById('renameProjectModal')
const projectNameUpdate = document.getElementById('projectNameUpdate')

renameModal.addEventListener('shown.bs.modal', () => {
  projectNameUpdate.focus()
})

