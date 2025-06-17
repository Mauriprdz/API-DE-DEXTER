document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const charactersGrid = document.getElementById('characters-grid');
    const characterForm = document.getElementById('add-character-form');
    const characterIdInput = document.getElementById('character-id');
    const nameInput = document.getElementById('name');
    const actorInput = document.getElementById('actor');
    const descriptionInput = document.getElementById('description');
    const imageInput = document.getElementById('image');
    const cancelEditButton = document.getElementById('cancel-edit');
    const notificationContainer = document.getElementById('notification-container');
    
    // Carga a los personajes tardando mas en la animacion
    setTimeout(() => {
        loadCharacters();
    }, 300);
    
    // Verificar si viene de una edicion
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
        loadCharacterForEditing(editId);
    }
    
    characterForm.addEventListener('submit', handleCharacterFormSubmit);
    cancelEditButton.addEventListener('click', resetForm);
    
    // esta es la vista previa de la imagen
    imageInput.addEventListener('change', function(e) {
        const preview = document.createElement('div');
        preview.id = 'image-preview';
        preview.style.marginTop = '10px';
        
        // si existe elimina la vista anterior
        const oldPreview = document.getElementById('image-preview');
        if (oldPreview) {
            oldPreview.remove();
        }
        
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `
                    <p style="margin-bottom: 8px;">Vista previa:</p>
                    <img src="${e.target.result}" alt="Vista previa" style="max-width: 100%; max-height: 200px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                `;
                imageInput.parentNode.appendChild(preview);
            }
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // Funciones
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notificationContainer.appendChild(notification);
        
        // esto elimina la notificacion despues de 4 segundos
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
    
    function loadCharacters() {
        charactersGrid.innerHTML = '<div class="loading">Cargando personajes...</div>';
        
        fetch('/api/characters')
            .then(response => response.json())
            .then(characters => {
                displayCharacters(characters);
            })
            .catch(error => {
                console.error('Error al cargar los personajes:', error);
                charactersGrid.innerHTML = '<div class="error">Error al cargar los personajes. Por favor, intenta de nuevo más tarde.</div>';
                showNotification('Error al cargar personajes', 'error');
            });
    }
    
    function displayCharacters(characters) {
        charactersGrid.innerHTML = '';
        
        if (characters.length === 0) {
            charactersGrid.innerHTML = `
                <div class="no-characters" style="text-align: center; padding: 3rem;">
                    <i class="fas fa-users fa-4x" style="color: #ccc; margin-bottom: 1rem;"></i>
                    <p>No hay personajes para mostrar. ¡Agrega uno!</p>
                </div>
            `;
            return;
        }
        
        const template = document.getElementById('character-card-template');
        
        characters.forEach((character, index) => {
            const clone = document.importNode(template.content, true);
            const card = clone.querySelector('.character-card');
            
            card.style.animationDelay = `${index * 0.1}s`;
            
            const nameElement = clone.querySelector('.character-name');
            const actorElement = clone.querySelector('.character-actor');
            const descriptionElement = clone.querySelector('.character-description');
            const imageElement = clone.querySelector('.character-image');
            const imageContainer = clone.querySelector('.character-image-container');
            const editButton = clone.querySelector('.btn-edit');
            const deleteButton = clone.querySelector('.btn-delete');
            
            nameElement.textContent = character.name;
            actorElement.textContent = `Actor: ${character.actor}`;
            descriptionElement.textContent = character.description;
            
            nameElement.addEventListener('click', () => {
                window.location.href = `/character/${character.id}`;
            });
            
            // congiurar imagen
            if (character.image) {
                imageElement.src = `/static/${character.image}`;
                imageElement.alt = character.name;
            } else {
                imageContainer.innerHTML = `
                    <div class="no-image">
                        <i class="fas fa-user fa-3x"></i>
                        <p>Sin imagen</p>
                    </div>
                `;
            }
            
            // Configurar botones de acción
            editButton.addEventListener('click', () => {
                loadCharacterForEditing(character.id);
            });
            
            deleteButton.addEventListener('click', () => {
                if (confirm(`¿Estás seguro de que quieres eliminar a ${character.name}?`)) {
                    deleteCharacter(character.id);
                }
            });
            
            charactersGrid.appendChild(clone);
        });
    }
    
    function loadCharacterForEditing(id) {
        fetch(`/api/characters/${id}`)
            .then(response => response.json())
            .then(character => {
                characterIdInput.value = character.id;
                nameInput.value = character.name;
                actorInput.value = character.actor;
                descriptionInput.value = character.description;
                
                // Mostrar botón de cancelar
                cancelEditButton.style.display = 'block';
                
                // Cambiar texto del botón submit
                const submitButton = characterForm.querySelector('button[type="submit"]');
                submitButton.innerHTML = '<i class="fas fa-save"></i> Actualizar Personaje';
                
                // Cambiar título del formulario
                const formTitle = document.querySelector('#character-form h2');
                formTitle.innerHTML = '<i class="fas fa-user-edit"></i> Editar Personaje';
                
                // Resaltar el formulario
                document.getElementById('character-form').classList.add('editing');
                
                document.getElementById('character-form').scrollIntoView({ behavior: 'smooth' });
                
                showNotification(`Editando a ${character.name}`);
            })
            .catch(error => {
                console.error('Error al cargar el personaje para editar:', error);
                showNotification('Error al cargar el personaje', 'error');
            });
    }
    
    function handleCharacterFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(characterForm);
        const characterId = characterIdInput.value;
        
        // Mostrar indicador de carga
        const submitButton = characterForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        
        if (characterId) {
            // actualiza el personaje existente
            updateCharacter(characterId, formData);
        } else {
            // para crear un nuevo personaje
            createCharacter(formData);
        }
    }
    
    function createCharacter(formData) {
        fetch('/api/characters', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) throw new Error('Error al crear el personaje');
                return response.json();
            })
            .then(newCharacter => {
                showNotification(`¡Personaje ${newCharacter.name} creado con éxito!`);
                resetForm();
                loadCharacters();
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error al crear el personaje', 'error');
            })
            .finally(() => {
                // Restaurar botón
                const submitButton = characterForm.querySelector('button[type="submit"]');
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-save"></i> Guardar Personaje';
            });
    }
    
    function updateCharacter(id, formData) {
        fetch(`/api/characters/${id}`, {
            method: 'PUT',
            body: formData
        })
            .then(response => {
                if (!response.ok) throw new Error('Error al actualizar el personaje');
                return response.json();
            })
            .then(updatedCharacter => {
                showNotification(`¡Personaje ${updatedCharacter.name} actualizado con éxito!`);
                resetForm();
                loadCharacters();
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error al actualizar el personaje', 'error');
            })
            .finally(() => {
                // Restaurar botón
                const submitButton = characterForm.querySelector('button[type="submit"]');
                submitButton.disabled = false;
                submitButton.innerHTML = '<i class="fas fa-save"></i> Guardar Personaje';
            });
    }
    
    function deleteCharacter(id) {
        fetch(`/api/characters/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) throw new Error('Error al eliminar el personaje');
                return response.json();
            })
            .then(() => {
                showNotification('¡Personaje eliminado con éxito!');
                loadCharacters();
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error al eliminar el personaje', 'error');
            });
    }
    
    function resetForm() {
        characterForm.reset();
        characterIdInput.value = '';
        cancelEditButton.style.display = 'none';
        
        const submitButton = characterForm.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<i class="fas fa-save"></i> Guardar Personaje';
        
        const formTitle = document.querySelector('#character-form h2');
        formTitle.innerHTML = '<i class="fas fa-user-plus"></i> Agregar Personaje';
        
        document.getElementById('character-form').classList.remove('editing');
        
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) {
            imagePreview.remove();
        }
    }
});
