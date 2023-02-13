const express = require('express')
const expressLayouts = require('express-ejs-layouts');
const morgan = require('morgan');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
// const validator = require('validator');
const cookieParser = require('cookie-parser');
const {body, validationResult, check} = require('express-validator');
const {loadContact, detailContact, addContact, deleteContact, editContact, listContact, duplicate} = require('./utils/contact');

//untuk menginformasikan dengan menggunakan view engine ejs
app.set('view engine', 'ejs')

//untuk memanggil library expresslayout
app.use(expressLayouts);

//untuk memunculkan foto
//built in middlewawre
app.use(express.static('img'));


//third party middleware
app.use(morgan('dev'));
app.use(cookieParser('secret'));
app.use(flash());

app.use(session({ 
    cookie : {maxAge: 6000},
    secret : 'anything',
    resave : true,
    saveUninitialized : true,
}));

//untuk parsing ke json
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

//middleware
app.use((req, res, next) => {
    console.log('Time:', Date.now())
    next()
  })


//akses tampilan index
app.get('/', (req, res) => {
    res.render('index', {
        title : 'Home Page'
    })
})

//akses untuk ke halaman about
app.get('/about', (req,res) => {
    res.render('about', {
        title : 'About Page'  
    })
})

//akses halaman contact
app.get('/contact', (req,res) => {
    const contact = loadContact();
    res.render('contact', {
        title : 'Halaman Contact', 
        contact,
        msg: req.flash('msg')
    })
})

//untuk tambah data contact
app.get('/contact/add', (req,res) => {
    res.render('add-contact', {
        title : 'Tambah Contact'
    })
})

//untuk post data yang ditambahkan ke json
app.post('/contact',
[
    body('nama').custom((value) => {
        const duplicateCheck = duplicate(value);
        if(duplicateCheck) {
            throw new Error('Nama sudah ada');
        } 
        return true;
    }),
    check('tlp', 'Format No Telepon Tidak Sesuai').isMobilePhone('id-ID'),
    check('email', 'Format Email Tidak Sesuai').isEmail(),
],
(req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('add-contact', {
            title : 'Halaman Tambah Data',
            errors : errors.array()
        })
    } else {
    addContact(req.body);
    req.flash('msg', 'Data Berhasil di Tambahkan!');
    res.redirect('/contact');
        }
    }
)

//untuk cek detail contact
app.get('/contact/:nama', (req,res) => {
    const contact = detailContact(req.params.nama);
    res.render('detail', {
        title : 'Detail',
        contact
    })
})

//untuk delete contact
app.get('/contact/delete/:nama', (req,res) => {
    const contact = detailContact(req.params.nama);
    if (!contact) {
        res.status(404);
        res.send('PAGE NOT FOUND : 404');
    } else {
        deleteContact(req.params.nama);
        req.flash('msg', 'Data Berhasil Dihapus!');
        res.redirect('/contact');
    }
})

//untuk edit contact
app.get('/contact/edit/:nama', (req,res) => {
    const contact = detailContact(req.params.nama);
    res.render('edit-contact', {
        title : 'Edit',
        contact
    })
})

//proses edit contact
app.post('/contact/edit', 
    [
        body('nama').custom((value) => {
            const duplicateCheck = duplicate(value);
            if(duplicateCheck) {
            throw new Error('Nama sudah ada');
        } 
        return true;
        }),
        check('tlp', 'Format No Telepon Tidak Sesuai').isMobilePhone('id-ID'),
        check('email', 'Format Email Tidak Sesuai').isEmail(),
    ],
    (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('edit-contact', {
            title : 'Halaman Edit Data',
            errors : errors.array(),
            contact : req.body
        })
    } else {
        editContact(req.body);
        req.flash('msg', 'Data Berhasil Diubah!');
        res.redirect('/contact');
    }
})

//untuk akses tampilan 404 atau root
app.use('/',(req,res) => {
    res.status(404);
    res.send('PAGE NOT FOUND : 404');
})

//untuk menggunakan pada localhost dengan port 3000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})