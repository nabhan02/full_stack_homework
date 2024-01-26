
// Define the displayFileTree function
function displayFileTree(fileTree, container) {
    container.innerHTML = ''; // Clear previous content

    function createListItem(node) {
        const listItem = document.createElement('li');
        const toggleButton = document.createElement('button');
        const openFileButton = document.createElement('button');

        // Keep track of the visibility state
        let isVisible = false;

        toggleButton.addEventListener('click', () => {
            isVisible = !isVisible;
            const subdirectoryContainer = listItem.querySelector('ul');
            const buttonContainer = listItem.querySelector('button');
            if (subdirectoryContainer) {
                // Toggle visibility of subdirectories
                subdirectoryContainer.style.display = isVisible ? 'block' : 'none';
                buttonContainer.textContent = isVisible ? 'collapse -' : 'expand +';
            }
        });

        openFileButton.addEventListener('click', () => {
            fetchFileContent(node.path);
        })

        const label = document.createElement('span');
        label.textContent = node.name;
        listItem.appendChild(label);

        if (node.type == 'folder'){
            listItem.appendChild(toggleButton);

        }


        if (node.type === 'file' && node._2d) {
            openFileButton.textContent = 'preview';
            openFileButton.className = 'preview';
            listItem.appendChild(openFileButton);
        }


        if (node.type === 'folder' && node.children && node.children.length > 0) {
            const subdirectoryContainer = document.createElement('ul');
            const buttonContainer = listItem.querySelector('button');

            buttonContainer.textContent = isVisible ? 'collapse -' : 'expand +';

            subdirectoryContainer.style.display = 'none'; // Initially hide subdirectories
            node.children.forEach(childNode => {
                const subListItem = createListItem(childNode);
                subdirectoryContainer.appendChild(subListItem);
            });
            listItem.appendChild(subdirectoryContainer);
        }

        return listItem;
    }

    fileTree.forEach(node => {
        const listItem = createListItem(node);
        container.appendChild(listItem);
    });
}

// Define the fetchFileTree function
async function fetchFileTree() {
    try {
        const response = await fetch('http://localhost:3000/file-tree?path=files');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const fileTree = await response.json();
        const container = document.getElementById('fileTree'); // Assuming you have an element with id 'fileTree'

        if (container) {
            // Display the file tree in the specified container
            displayFileTree(fileTree, container);
        } else {
            console.error('Container not found');
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

async function fetchFileContent(path) {
    try {
        const response = await fetch(`http://localhost:3000/file-content?path=${path}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const fileContent = await response.json();
        
        var tab = window.open('about:blank', '_blank');
        tab.document.write(fileContent);
        tab.document.close();

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

// Initial file tree fetch and display
fetchFileTree();
