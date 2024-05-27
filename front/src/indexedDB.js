import { openDB } from 'idb';

const DATABASE_NAME = 'my-database';
const DATABASE_VERSION = 1;
const EMPLOYEE_STORE = 'employees';
const PROJECT_STORE = 'projects';

const initDB = async () => {
  return openDB(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(EMPLOYEE_STORE)) {
        db.createObjectStore(EMPLOYEE_STORE, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(PROJECT_STORE)) {
        db.createObjectStore(PROJECT_STORE, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const addEmployee = async (employee) => {
  const db = await initDB();
  const tx = db.transaction(EMPLOYEE_STORE, 'readwrite');
  const store = tx.objectStore(EMPLOYEE_STORE);
  await store.add(employee);
  await tx.done;
};

export const addProject = async (project) => {
  const db = await initDB();
  const tx = db.transaction(PROJECT_STORE, 'readwrite');
  const store = tx.objectStore(PROJECT_STORE);
  await store.add(project);
  await tx.done;
};

export const getEmployees = async () => {
  const db = await initDB();
  const tx = db.transaction(EMPLOYEE_STORE, 'readonly');
  const store = tx.objectStore(EMPLOYEE_STORE);
  const employees = await store.getAll();
  await tx.done;
  return employees;
};

export const getProjects = async () => {
  const db = await initDB();
  const tx = db.transaction(PROJECT_STORE, 'readonly');
  const store = tx.objectStore(PROJECT_STORE);
  const projects = await store.getAll();
  await tx.done;
  return projects;
};

