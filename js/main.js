var dbName ='my_notes_db';
function getDbSchema() {
  var tblNotes = {
    name: 'my_notes_table',
    columns: {
        // Here "Id" is name of column 
        id:{ primaryKey: true, autoIncrement: true },
        noteText:  { notNull: true, dataType: "string" }
    }
  };
  var db = {
      name: dbName,
      tables: [tblNotes]
  }
  return db;
}


// executing jsstore inside a web worker
var connection = new JsStore.Connection(new Worker('js/jsstore.worker.js'));

async function initMyNote() {
      var database = getDbSchema();
      const isDbCreated = await connection.initDb(database);
      if(isDbCreated===true){
          console.log("db created");
          document.getElementById("status").style.backgroundColor = "green";
          document.getElementById("status").innerText = "CREATED NEW DATABASE";
      }
      else {
          console.log("db opened");
          document.getElementById("status").style.backgroundColor = "#429af5";
          document.getElementById("status").innerText = "OPENED EXISTING DATABASE";
          getAllNotes();
      }
}

async function newNote() {
  var new_note_value = { noteText : document.getElementById("note_text").value.replace(/\n\r?/g, '<br />') };
  var noOfDataInserted = await connection.insert({
      into: 'my_notes_table',
      values: [new_note_value]
  });
  if (noOfDataInserted > 0) {
      document.getElementById("new_note_status").style.backgroundColor = "green";
      document.getElementById("new_note_status").innerText = "SAVED";
      getAllNotes();
      document.getElementById("note_text").value = ""
      setTimeout(
        function() {
          document.getElementById("new_note_status").style.backgroundColor = "transparent";
          document.getElementById("new_note_status").innerText = "";
        }
        ,1000);
  }
}

function newNoteWithHtml(note_id, note_text, note_date){
  singleHTML =  document.createElement('div');
  singleHTML.className = "note";

  var att = document.createAttribute("onClick");
  att.value = `deleteNote(${note_id})`;
  singleHTML.setAttributeNode(att);

  singleHTML.innerHTML= `<h3>${note_text}</h3><p>${note_date}</p>`;
  return singleHTML;
}

async function getAllNotes() {
  var results = await connection.select({ from: "my_notes_table" });
  var note_container = document.getElementById("notes");
  note_container.innerHTML = "";

  var temp_html = "";
  results.forEach(i => {
    note_container.appendChild(newNoteWithHtml(i.id,i.noteText,"xx-xx-xxxx"));
  })

}

async function deleteNote(note_id) {
  var rowsDeleted = await connection.remove({
    from: "my_notes_table",
    where: { id: note_id }
  });
  //results will contains no of rows deleted.
  if(rowsDeleted > 0) {
      document.getElementById("new_note_status").style.backgroundColor = "red";
      document.getElementById("new_note_status").innerText = "DELETED";
      getAllNotes();
      document.getElementById("note_text").value = ""
      setTimeout(
        function() {
          document.getElementById("new_note_status").style.backgroundColor = "transparent";
          document.getElementById("new_note_status").innerText = "";
        }
        ,1000);
  }
}

async function removeAllNotes() {
  await connection.clear("my_notes_table");
  document.getElementById("status").style.backgroundColor = "red";
  document.getElementById("status").innerText = "ALL NOTES DELETED";  
  getAllNotes();
  location.reload();
}