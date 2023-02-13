const express = require('express')
const pool = require('./db');
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

//fungsi untuk mengkonversi menjadi json
app.use(express.json());

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

// app.get("/addasync", async(req,res) => {
//     try {
//         const name = "prayoga"
//         const tlp = "082128409933"
//         const email = "prayoga@gmail.com"
//         const newCont = await pool.query(`INSERT INTO contacts values ('${name}', '${tlp}','${email}') RETURNING *`)
//         res.json(newCont)
//     } catch (err) {
//         console.error(err.message)
//     }
// })

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
app.get('/contact', async(req,res) => {
    const db = await pool.query(`SELECT * FROM contacts`);
    const contact = db.rows;
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
    body('nama').custom(async(value) => {
        const db = await pool.query(`SELECT * FROM contacts WHERE lower(nama) = lower('${value}')`);
        const duplicateCheck = db.rows[0];
        if(duplicateCheck) {
            throw new Error('Nama sudah ada');
        } 
        return true;
    }),
    check('tlp', 'Format No Telepon Tidak Sesuai').isMobilePhone('id-ID'),
    check('email', 'Format Email Tidak Sesuai').isEmail(),
],
async (req,res) => {
    const errors = validationResult(req);
    const {nama,tlp,email} = req.body;
    if (!errors.isEmpty()) {
        res.render('add-contact', {
            title : 'Halaman Tambah Data',
            errors : errors.array()
        })
    } else {
    await pool.query(`INSERT INTO contacts (nama,tlp,email) VALUES (lower('${nama}'),lower('${tlp}'),lower('${email}'))`);
    req.flash('msg', 'Data Berhasil di Tambahkan!');
    res.redirect('/contact');
        }
    }
)

//untuk cek detail contact
app.get('/contact/:nama', async(req,res) => {
    const db = await pool.query(`SELECT * FROM contacts WHERE contacts.nama = '${req.params.nama}'`);
    const contact = db.rows[0];
    // const contact = detailContact(req.params.nama);
    res.render('detail', {
        title : 'Detail',
        contact
    })
})

//untuk delete contact
app.get('/contact/delete/:nama', async(req,res) => {
    const {nama} = req.params;
    const contact = await pool.query(`DELETE FROM contacts WHERE nama = $1`, [nama]);
    // const contact = detailContact(req.params.nama);
    if (!contact) {
        res.status(404);
        res.send('PAGE NOT FOUND : 404');
    } else {
        // deleteContact(req.params.nama);
        req.flash('msg', 'Data Berhasil Dihapus!');
        res.redirect('/contact');
    }
})

//untuk edit contact
app.get('/contact/edit/:nama', async(req,res) => {
    const db = await pool.query(`SELECT * FROM contacts WHERE lower(nama) = lower('${req.params.nama}')`);
    const contact = db.rows[0];
    res.render('edit-contact', {
        title : 'Edit',
        contact
    })
})

//proses edit contact
app.post('/contact/edit', 
    [
        body('nama').custom(async(value) => {
            const db = await pool.query(`SELECT * FROM contacts WHERE lower(nama) = lower('${value}')`);
            const duplicateCheck = db.rows[0];
            if(duplicateCheck) {
            throw new Error('Nama sudah ada');
        } 
        return true;
        }),
        check('tlp', 'Format No Telepon Tidak Sesuai').isMobilePhone('id-ID'),
        check('email', 'Format Email Tidak Sesuai').isEmail(),
    ],
    async (req,res) => {
    const {namaLama,nama,tlp,email} = req.body;
    // const contact = db.rows[0];
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('edit-contact', {
            title : 'Halaman Edit Data',
            errors : errors.array(),
            contact : req.body
        })
    } else {
        await pool.query(`UPDATE contacts SET nama = '${nama}', tlp = '${tlp}', email = '${email}' WHERE lower(nama) = lower('${namaLama}')`);
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