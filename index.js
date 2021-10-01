const Joi = require('joi');
const express = require('express');
const app = express();
const fs = require("fs");
const { parse } = require('path');
app.use(express.json());

fs.readFile('FINAL_DATA.json', (err, data) => {
    if (err) throw err;
    let students = JSON.parse(data);

app.get('/', (req, res) => {
    res.send(`
    <h2>Welcome to the API.</h2>
    Get: /: welcome page
    Get: /api/students: return full list
    sort = name
    order = asc|desc<br>
    exmple:/api/students?sort=name&order=asc default order is asc<br><br>
    GET: /api/students/filter: filters the students by a key, accepts major and returns users matches the major. Examples: ?major=art ?major=art|programming<br>
    GET: /api/students/:id: returns a single student by id<br>
    POST: /api/students: insert a new student submitted in the request body
PUT: /api/students/:id: updates an existing student id with the submitted data in the request body DELETE: /api/students/:id: deletes the student by id<br>
    `);
});

// this calling function is can display the data when putting url like '/api/students?id='
// '/api/students?name=' or '/api/students?major='
// app.get('/api/students', (req, res) => {
//     const filters = req.query;
//     const filteredUsers = students.filter(user => {
//         let isValid = true;
//         for (key in filters) {
//         console.log(key, user[key], filters[key]);
//         isValid = isValid && user[key] == filters[key];
//     }
//     return isValid;
//     });
    
//     res.send(filteredUsers); 
// });

// sort by name
app.get('/api/students', (req, res) => {
    if (req.query.sort && req.query['sort'] == 'name'){
        if (req.query['order'] == 'desc'){
            var sortedStudents = sortbyName(students, false);
            return res.send(sortedStudents);
        }else {
            var sortedStudents = sortbyName(students,true);
            return res.send(sortedStudents);
        }
    }
    else {
        return res.send(students)
    }
});

// filter by major
app.get('/api/students/filter/:major', (req, res) => {
    getGradeObject(students);
    hideSubjects(students);
    var student = students.filter(c => c.major == req.params.major);
    if (!student) return res.status(404).send('The student with the given major was not found')
    res.send(student);
});

// get student by ID
app.get('/api/students/:id', (req, res) => {
    var student = students.find(c => c.id === parseInt(req.params.id));
    getGrade(student);
    if (!student) return res.status(404).send('The student with the given ID was not found')
    res.send(student);
});

// Post
app.post('/api/students', (req, res) => {
    const { error } = validatestudent(req.body);
    if(error)return res.status(400).send(error.details[0].message)
        
    const student = {
        id: Math.floor(Math.random() * 10000),
        name: req.body.name,
        email: req.body.email,
        major: req.body.major,
        subjects: req.body.subjects
    };
    students.push(student);
    res.send(student);
});

// Put
app.put('/api/students/:id', (req, res) =>{
    const student = students.find(c => c.id === parseInt(req.params.id));
    if (!student) return res.status(404).send('The student with the given ID was not found')
    

    const { error } = validatestudent(req.body);
    if(error) return res.status(400).send(error.details[0].message)
    
    student.name = req.body.name;
    student.email = req.body.email;
    student.major = req.body.major;
    student.subjects = req.body.subjects;
    res.send(student);
})

// Delete
app.delete('/api/students/:id', (req, res) => {
    const student = students.find(c => c.id === parseInt(req.params.id));
    if (!student) return res.status(404).send('The student with the given ID was not found')

    const index = students.indexOf(student);
    students.splice(index, 1);

    res.send(student);
})

//sort function
function sortbyName(array, ascending = true){    
    if (ascending){
        var array = array.sort((a,b) => a.name.localeCompare(b.name)); 
      } else {
        var array = array.sort((a,b) => b.name.localeCompare(a.name));
      }
    return array;
};

// generate gpa function
function getGrade(array){
    var sub = Object.values(array["subjects"])
    var sum = 0;
    for( var i = 0; i < sub.length; i++ ){
        sum += parseFloat( sub[i], 10 );
    };
    var avg = parseFloat(sum/sub.length).toFixed(2);
    return array["grade"] = avg
};

// generate grade for the json file
function getGradeObject(object){
    for(var j = 0; j < object.length; j++){
        getGrade(object[j])
    }
    return object
}

// delete subjects
function hideSubjects(object){
    for(var j = 0; j < object.length; j++){
        delete object[j].subjects;
    }
    return object
}

//Validate
function validatestudent(student){
    const schema = {
        name: Joi.string().min(1).max(32).required(),
        email: Joi.string().required(),
        major: Joi.number().valid("art", "programming","accounting","programming|accounting").required(),
        // subjects: Joi.object().key({
        //     content: Joi.object().pattern(/^[\w\d]+$/, Joi.object().required().keys({
        //         'html': Joi.number().min(0).max(5).required(),
        //         'css': Joi.number().min(0).max(5).required(),
        //         'javascript': Joi.number().min(0).max(5).required()
        //     }))
        // })
        subjects: Joi.object().required() //not sure how to validate the object
    };

    return Joi.validate(student, schema);
}
});

// PORT
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));