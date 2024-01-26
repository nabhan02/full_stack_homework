import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import mysql from 'mysql2';

const app = express();
const port = 3000;

const db = mysql.createPool({
    host: 'localhost',
    port: 3306,
    password: 'mysecretpassword',
    database: 'machina_labs',
    user: 'root',
});

const QUERY = {
    SELECT_CUSTOMERS: 'SELECT * FROM customers',
    SELECT_PART: 'SELECT * FROM part',
    SELECT_PART_REVISION: 'SELECT * FROM part_revision',
    SELECT_TRIAL: 'SELECT * FROM trial'
}
  

app.use(cors({ origin: 'null' })); 

// Serve static files
app.use(cors({ origin: 'http://127.0.0.1:8080' }));
app.use(express.static('static'));

// File tree endpoint
app.get('/file-tree', async (req, res) => {
    const directoryPath = req.query.path || 'file'; // Default path if not provided
    try {
        const fileTree = await getFileTree(directoryPath);
        res.json(fileTree);
    } catch (error) {
        console.error('Error fetching file tree:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/file-content', async(req, res) => {
    const filePath = req.query.path;

    try {
        const content = await fs.promises.readFile(filePath, { encoding: 'utf8' }); 
        res.json(content)
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error'})
    }

});


async function traverseDirectory(directoryPath) {
    const fileTree = [];
    const items = await fs.promises.readdir(directoryPath);

    for (const item of items) {
        const itemPath = path.join(directoryPath, item);
        const stat = await fs.promises.stat(itemPath);
        const itemType = stat.isDirectory() ? 'folder' : 'file';

        const node = { name: item, path: itemPath, type: itemType, toggle: false };
        if (stat.isDirectory()) {
            node.children = await traverseDirectory(itemPath); // Recursively traverse subdirectories
            node.toggle = true;
        } else {
            const fileName = node.name.split('.');
            const fileType = fileName[fileName.length - 1];
            const _3D_extensions = ['stl', 'step', 'ply'];

            if (!(_3D_extensions.includes(fileType))) {
                node._2d = true;

            } else {
                node._2d = false;
            }

        }

        // var customer = getCustomers(node.name);
        // console.log(util.inspect(customer, {depth: null}));
        // var part = getParts(node.name);
        // var part_revision = getPartRevision(node.name);
        // var trial = getTrial(node.name);
        // if (customer !== "" || customer !== null) {
        //     node.name = customer;
        // } else if (part !== '' || part !== null) {
        //     node.name = part;
        // } else if (part_revision !== '' || part_revision !== null){
        //     node.name = part_revision;
        // } else if (trial !== '' || trial !== null) {
        //     node.name = trial;
        // }


        fileTree.push(node);

    }

    return fileTree;
}

async function getFileTree(directoryPath) {
    const fileTree = await traverseDirectory(directoryPath);
    return fileTree;
}

async function getCustomers(id) {
    db.query(QUERY.SELECT_CUSTOMERS, (error, results) => {
        if (error) {
            throw error;
        }
        return results;
    });
}

async function getParts(id) {
    let values = null;
    db.query(QUERY.SELECT_PART, (error, results) => {
        values = results;
    });

    if (values == null) {
        return '';
    }

    values.forEach(element => {
        if (element.uuid === id) {
            return element.name;
        }
    });
    return '';
}

async function getPartRevision(id) {
    let values = null;
    db.query(QUERY.SELECT_PART_REVISION, (error, results) => {
        values = results;
    });

    if (values == null) {
        return '';
    }

    values.forEach(element => {
        if (element.uuid === id) {
            return element.name;
        }
    });
    return '';
}

async function getTrial(id) {
    let values = null;
    db.query(QUERY.SELECT_PART, (_, results) => {
        values = results;
    });

    if (values == null) {
        return '';
    }

    values.forEach(element => {
        if (element.uuid === id) {
            return getPartRevision(element.part_revision_uuid);
        }
    });
    return '';
}


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});