const DEFAULT_STATE = {
    folders: [
      {
        id: '1',
        name: '\u270D\uFE0F Writing Assistant',
        prompts: [
          {
            id: '1-1',
            title: 'Professional Email',
            content: `Write a professional email that is concise, clear, and maintains a friendly yet formal tone. Consider the following structure:
  1. Brief greeting
  2. Clear purpose in the first sentence
  3. Necessary details in 1-2 paragraphs
  4. Specific call to action
  5. Professional closing
  
  Make sure to:
  - Be concise and respect the recipient's time
  - Maintain a professional tone
  - Include all necessary information
  - End with a clear next step`
          }
        ]
      },
      {
        id: '2',
        name: '\u{1F4BB} Code Helper',
        prompts: [
          {
            id: '2-1',
            title: 'Code Review',
            content: `Please review this code for:
  1. Potential bugs and errors
  2. Performance improvements
  3. Best practices
  4. Code style and consistency
  5. Security concerns
  
  Provide specific examples and explanations for any issues found.`
          }
        ]
      },
      {
        id: '3',
        name: '\u{1F4DD} Content Creation',
        prompts: [
          {
            id: '3-1',
            title: 'Blog Post Structure',
            content: `Create a well-structured blog post following this framework:
  1. Attention-grabbing introduction
  2. Clear value proposition
  3. Main points (3-5 sections)
  4. Supporting evidence and examples
  5. Actionable takeaways
  
  Ensure to:
  - Use engaging subheadings
  - Include relevant examples
  - Maintain consistent tone
  - End with a clear conclusion
  - Add a call to action`
          }
        ]
      }
    ]
  };
  
  let state = {
    folders: []
  };
  
  document.addEventListener('DOMContentLoaded', () => {
    loadState();
    setupEventListeners();
  });
  
  async function loadState() {
    const result = await chrome.storage.local.get(['promptManager']);
    if (result.promptManager) {
      state = result.promptManager;
    } else {
      // Load default state if no saved state exists
      state = DEFAULT_STATE;
      await saveState();
    }
    renderLibrary();
  }
  
  async function saveState() {
    await chrome.storage.local.set({ promptManager: state });
  }
  
  function setupEventListeners() {
    document.getElementById('createFolder').addEventListener('click', () => {
      showFolderModal();
    });
    document.getElementById('searchPrompts').addEventListener('input', handleSearch);
    document.getElementById('saveFolder').addEventListener('click', handleFolderSave);
    document.getElementById('savePrompt').addEventListener('click', handlePromptSave);
    document.getElementById('cancelFolder').addEventListener('click', () => {
      document.getElementById('folderModal').style.display = 'none';
    });
    document.getElementById('cancelPrompt').addEventListener('click', () => {
      document.getElementById('promptModal').style.display = 'none';
    });
  }
  
  function showFolderModal(isEdit = false, folder = null) {
    const modal = document.getElementById('folderModal');
    const titleEl = document.getElementById('folderModalTitle');
    const nameInput = document.getElementById('folderName');
  
    titleEl.textContent = isEdit ? 'Edit Folder' : 'Create New Folder';
    nameInput.value = folder ? folder.name : '';
    
    modal.style.display = 'block';
    nameInput.focus();
  }
  
  async function handleFolderSave() {
    const nameInput = document.getElementById('folderName');
    const name = nameInput.value.trim();
    
    if (!name) return;
  
    const newFolder = {
      id: Date.now().toString(),
      name,
      prompts: []
    };
  
    state.folders.push(newFolder);
    await saveState();
    renderLibrary();
    
    document.getElementById('folderModal').style.display = 'none';
    nameInput.value = '';
  }
  
  function showPromptModal(folderId, isEdit = false, prompt = null) {
    const modal = document.getElementById('promptModal');
    const titleEl = document.getElementById('modalTitle');
    const promptTitleInput = document.getElementById('promptTitle');
    const promptContentInput = document.getElementById('promptContent');
  
    titleEl.textContent = isEdit ? 'Edit Prompt' : 'Create New Prompt';
    promptTitleInput.value = prompt ? prompt.title : '';
    promptContentInput.value = prompt ? prompt.content : '';
    
    state.currentFolder = folderId;
    modal.style.display = 'block';
    promptTitleInput.focus();
  }
  
  async function handlePromptSave() {
    const titleInput = document.getElementById('promptTitle');
    const contentInput = document.getElementById('promptContent');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title || !content) return;
  
    const newPrompt = {
      id: Date.now().toString(),
      title,
      content
    };
  
    const folder = state.folders.find(f => f.id === state.currentFolder);
    if (folder) {
      folder.prompts.push(newPrompt);
      await saveState();
      renderLibrary();
    }
    
    document.getElementById('promptModal').style.display = 'none';
    titleInput.value = '';
    contentInput.value = '';
  }
  
  async function handleDelete(folderId, promptId = null) {
    if (promptId) {
      const folder = state.folders.find(f => f.id === folderId);
      if (folder) {
        folder.prompts = folder.prompts.filter(p => p.id !== promptId);
      }
    } else {
      state.folders = state.folders.filter(f => f.id !== folderId);
    }
    
    await saveState();
    renderLibrary();
  }
  
  function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const folders = document.querySelectorAll('.folder');
    
    folders.forEach(folder => {
      const folderName = folder.querySelector('.folder-name').textContent.toLowerCase();
      const prompts = folder.querySelectorAll('.prompt-item');
      let hasMatch = folderName.includes(searchTerm);
      
      prompts.forEach(prompt => {
        const promptText = prompt.querySelector('.prompt-title').textContent.toLowerCase();
        const match = promptText.includes(searchTerm);
        prompt.style.display = match ? 'flex' : 'none';
        hasMatch = hasMatch || match;
      });
      
      folder.style.display = hasMatch ? 'block' : 'none';
    });
  }
  
  async function copyPrompt(promptContent) {
    try {
      await navigator.clipboard.writeText(promptContent);
      // Could add a success notification here
      const notification = document.createElement('div');
      notification.className = 'copy-notification';
      notification.textContent = 'Copied to clipboard!';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
  
  function renderLibrary() {
    const container = document.getElementById('promptLibrary');
    container.innerHTML = '';
    
    state.folders.forEach(folder => {
      const folderEl = document.createElement('div');
      folderEl.className = 'folder';
      
      folderEl.innerHTML = `
        <div class="folder-header">
          <span class="folder-name">${folder.name}</span>
          <div class="actions">
            <button class="btn add-prompt">add</button>
            <button class="btn mod-folder">mod</button>
            <button class="btn del-folder">del</button>
          </div>
        </div>
        <div class="folder-content">
          ${folder.prompts.map(prompt => `
            <div class="prompt-item">
              <span class="prompt-title">${prompt.title}</span>
              <div class="actions">
                <button class="btn copy-prompt" data-content="${prompt.content.replace(/"/g, '&quot;')}">copy</button>
                <button class="btn mod-prompt">mod</button>
                <button class="btn del-prompt">del</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      
      // Add event listeners
      const header = folderEl.querySelector('.folder-header');
      const content = folderEl.querySelector('.folder-content');
      
      header.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn')) {
          content.classList.toggle('open');
        }
      });
      
      folderEl.querySelector('.add-prompt').addEventListener('click', () => {
        showPromptModal(folder.id);
      });
      
      folderEl.querySelector('.mod-folder').addEventListener('click', () => {
        showFolderModal(true, folder);
      });
      
      folderEl.querySelector('.del-folder').addEventListener('click', () => {
        handleDelete(folder.id);
      });
      
      const copyButtons = folderEl.querySelectorAll('.copy-prompt');
      copyButtons.forEach(button => {
        button.addEventListener('click', () => {
          copyPrompt(button.dataset.content);
        });
      });
      
      const modPromptButtons = folderEl.querySelectorAll('.mod-prompt');
      modPromptButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
          showPromptModal(folder.id, true, folder.prompts[index]);
        });
      });
      
      const delPromptButtons = folderEl.querySelectorAll('.del-prompt');
      delPromptButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
          handleDelete(folder.id, folder.prompts[index].id);
        });
      });
      
      container.appendChild(folderEl);
    });
  }