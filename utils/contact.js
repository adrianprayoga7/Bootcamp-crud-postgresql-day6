const fs = require('fs');
// const validator = require('validator');

//membuat dan mengecek folder bernama data
const dirPath = './data';
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath);
}

//membuat dan mengecek file bernama contacts.json
const dataPath = './data/contacts.json';
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync (dataPath, '[]', 'utf-8');
}

//load data kontak dari contacts.json
const loadContact = () => {
    const file = fs.readFileSync('data/contacts.json', 'utf-8');
    const contacts = JSON.parse(file);
    return contacts;
}

//melihat detail contact
const detailContact = nama => {
    const contacts = loadContact();
    const contact = contacts.find((contact) => contact.nama.toLowerCase() === nama.toLowerCase());
    if (!contact) {
        console.log((`${nama} tidak ditemukan!`));
        return false;
    } else {
        console.log(contact.nama);
        console.log(contact.tlp);
        console.log(contact.email);
    }
    return contact;
}

//untuk menyimpan kontak baru
const saveContact = (contacts) => {
  fs.writeFileSync('data/contacts.json', JSON.stringify(contacts));
}

//untuk menambah data baru
const addContact = (contact) => {
  const contacts = loadContact();
  saveContact(contacts);
}


// //melihat list contact
const listContact = () => {
  const contacts = loadContact();
  console.log("Contact List : ");
  contacts.forEach((contact, i) => {
    console.log(`${i + 1}. ${contact.nama} - ${contact.tlp}`);
  });
  return contacts;
};

//tujuannya untuk hapus kontak berdasarkan nama
const deleteContact = (nama) => {
    const contacts = loadContact();
    const filterContact = contacts.filter((contact) => contact.nama !== nama);
    fs.writeFileSync('data/contacts.json', JSON.stringify(filterContact));
}

//tujuannya untuk mengubah kontak
const editContact = (contactBaru) => {
  const contacts = loadContact();
  const filterContact = contacts.filter((contact) => contact.nama.toLowerCase() !== contactBaru.namaLama.toLowerCase());
  delete contactBaru.namaLama;
  filterContact.push(contactBaru);
  saveContact(filterContact);
}

//tujuannya untuk mengecek duplikat 
const duplicate = (nama) => {
  const contacts = loadContact();
  return contacts.find((contact) => contact.nama === nama);
}

//export fungsi
module.exports = {loadContact, detailContact, addContact, duplicate, deleteContact, editContact, listContact};