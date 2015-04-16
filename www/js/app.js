//app.js
var db = openDatabase('dataappDB', '1.0', 'DataApp DB', 1024*1024);

//Cordova data app: back button on gift pages, double tap delete (and remove from database),  monochromatic, github repo

//when loadPage(gift-idea) and loadPage(gift-occ) are fired -> Select query with occ_id, person_id, gift_idea
//back button on persGiftIdea-> loadPage(people)
//back button on occGiftIdea -> loadPage(occasions)
//double tap on peopleview-> DELETE people_name FROM people WHERE people_id IS e.target.data-ref


var app= {
	loadRequirements:0,
	init: function(){
		document.addEventListener("deviceready", app.onDeviceReady);
		document.addEventListener("DOMContentLoaded", app.onDomReady);
	},
	onDeviceReady: function(){
		app.loadRequirements++;
		if(app.loadRequirements === 2){
			app.start();
		}
	},
	onDomReady: function(){
		//app.loadRequirements++;
        app.loadRequirements = 2;
		if(app.loadRequirements === 2){
			app.start();
		}
	},
	start: function(){
         db.transaction(function(data){
                //something to do in addition to incrementing the value
                //otherwise your new version will be an empty DB

                //do the initial setup               
            data.executeSql('CREATE TABLE IF NOT EXISTS gifts(gift_id INTEGER PRIMARY KEY AUTOINCREMENT, person_id INTEGER, occ_id INTEGER, gift_idea VARCHAR, purchased BOOLEAN)');
            data.executeSql('CREATE TABLE IF NOT EXISTS occasions(occ_id INTEGER PRIMARY KEY AUTOINCREMENT, occ_name VARCHAR)'); 
            data.executeSql('CREATE TABLE IF NOT EXISTS people(people_id INTEGER PRIMARY KEY AUTOINCREMENT, people_name VARCHAR)');
                   
            
            //LOAD PEOPLE ITEMS
            data.executeSql('SELECT * FROM people', [], function(data, results){
                var resultLength = results.rows.length;     
                for(var i=0; i<resultLength; i++){
                    createList('peopleView', results.rows.item(i).people_name, results.rows.item(i).people_id);
                }                    
            });
             //LOAD OCCASIONS ITEMS
            data.executeSql('SELECT * FROM occasions', [], function(data, results){
                var resultLength = results.rows.length;     
                for(var i=0; i<resultLength; i++){
                    createList('occasionView', results.rows.item(i).occ_name, results.rows.item(i).occ_id);
                }                    
            });
             
            console.log('loaded table');
          
            console.log('started app');
            //connect to database
            //build the lists for the main pages based on data
            //add button and navigation listeners

            //MODAL SAVE BUTTONS
                document.getElementById("btnSavePerson").addEventListener("click", function(){
                    var personName = document.getElementById('new-per').value;
                    app.save('people','people_name',personName);
                    
                    db.transaction(function(data){
                        data.executeSql("SELECT people_id FROM people WHERE people_name IS '"+personName+"'", [], function(data, results){
                            var person_id = results.rows.item(0).people_id;
                            createList('peopleView', personName, person_id);
                        });
                    });
            
                });
                document.getElementById("btnSaveOccasion").addEventListener("click", function(){
                    var occName = document.getElementById('new-occ').value;
                    app.save('occasions','occ_name',occName);
                    
                    db.transaction(function(data){
                        data.executeSql("SELECT occ_id FROM occasions WHERE occ_name IS '"+occName+"'", [], function(data, results){
                            var occ_id = results.rows.item(0).occ_id;
                            createList('occasionView', occName, occ_id);
                        });
                    });
                    
                });
                document.getElementById("btnSavePersGift").addEventListener("click", function(){
                    var newPersGift = document.getElementById('new-pers-gift').value;
                    app.save('gifts','gift_idea',newPersGift);
                    
                    db.transaction(function(data){
                        data.executeSql("SELECT gift_id FROM gifts WHERE gift_idea IS '"+newPersGift+"'", [], function(data, results){
                            var persGift_id = results.rows.item(0).gift_id;
                            createList('giftsPersonView', newPersGift, persGift_id);
                        });
                    });
                     
                });
                document.getElementById("btnSaveOccGift").addEventListener("click", function(){
                    var newOccGift = document.getElementById('new-occ-gift').value 
                        + "-" + document.querySelector('#list-per-occ option').innerHTML;

                    app.save('gifts','gift_idea',newOccGift);
                    
                    db.transaction(function(data){
                        data.executeSql("SELECT gift_id FROM gifts WHERE gift_idea IS '"+newOccGift+"'", [], function(data, results){
                            var occGift_id = results.rows.item(0).gift_id;
                            createList('giftsOccasionView', newOccGift, occGift_id);
                        });
                    });
                    
                });
        
        });
        Hammertime();
        
	},
    /*edit: function(ev){
        //alert("edit");
        //ev.stopPropagation();

        document.getElementById("test").style.display="block";
        document.querySelector("[data-role=overlay]").style.display="block";

        var item = ev.target.getAttribute("data-ref");
        var itemVal = ev.target.innerHTML;
        document.getElementById("list").value = item;
    }*/
    edit: function(ev){
        
    },
    cancel: function(){
            var selected = document.querySelectorAll("[data-role=modal]");
            for (var i = 0; i <	selected.length; i++) {
                selected[i].style.display="none";
            }
            document.querySelector("[data-role=overlay]").style.display="none";     
    },
    save: function(tableName, colName, newName){
            db.transaction(function(data){
                data.executeSql("INSERT INTO "+tableName+"("+colName+") VALUES('"+newName+"')");
            });
            app.cancel();
    },
    delete: function(ev){
        
    },
    query: function(theQuery, queryType, theRow){        
        alert('app.query called');    
        console.log('heard:'+theQuery+" queryType:"+queryType+" theRow: "+theRow);

            if (queryType == "return"){
                db.transaction(function(data){
                    data.executeSql(theQuery, [], function(data, results){
                        //console.log('data: '+data+' results:'+results);      
                        var resultLength = results.rows.length;
                        
                        for(var i=0; i<resultLength; i++){
                            //createList('peopleView', results.rows.item(i).people_name, results.rows.item(i).people_id);
                        }
                    });
                });

            }else if(queryType == "void"){
                db.transaction(function(data){
                    data.executeSql(theQuery);
                });
            }else{
                alert('unknown queryType for app.query');
            } 
    }
}

app.init();




//specifying:  location of list to be created, the number of items to create, name and id result from SQLite query
function createList(holderName,nameResult,idResult){
    console.log('creating list inside '+holderName+', name is '+nameResult+'. and id is '+ idResult);
    var listHolder = document.getElementById(holderName);    
        
            var newItem = document.createElement('li');
           
            newItem.setAttribute("data-ref",idResult);
            newItem.innerHTML = nameResult; 
          
            listHolder.appendChild(newItem); 
    app.cancel();
}


function Hammertime(){
    console.log('Hammertime fired');
    
    
   //CANCEL BUTTON on all modals
        var selected = document.querySelectorAll(".btnCancel");   
        for (var i = 0; i <	selected.length; i++) {
   	        selected[i].addEventListener("click", app.cancel);
        }

    //PEOPLE
    var peoplePage = document.getElementById('peoplePage');
        var mc1 = new Hammer(peoplePage);
        mc1.on("swipeleft", function(){ loadPage('occasion') });
        mc1.on("swiperight",function(){ loadPage('occasion') /*animate('nudge')function here to trigger css nudge animation*/ });

    var btnAddPeople = document.getElementById('btnAddPeople');
        var mc2 = new Hammer(btnAddPeople);
        mc2.on("tap", function(){ 
            loadModal('add-person');
        });
    
        //tapping on a persons name
    var peopleView = document.getElementById('peopleView'); 
        var mc3 = new Hammer(peopleView);
        mc3.on("tap", function(ev){ 
            document.getElementById('tappedPers').innerHTML = ev.target.innerHTML;
            //function (data) {
            // data.executeSql('INSERT INTO people (person_name)');   
                
                
            //}
            loadPage('gifts-per');
        });
    
    //OCCASIONS
    var occasionsPage = document.getElementById('occasionsPage');
        var mc4 = new Hammer(occasionsPage);
        mc4.on("swipeleft", function(){ loadPage('people') });
        mc4.on("swiperight",function(){ loadPage('people') });
    
    var btnAddOccasion = document.getElementById('btnAddOccasion');
        var mc5 = new Hammer(btnAddOccasion);
        mc5.on("tap", function(){ loadModal('add-occasion') });
    
    var occasionView = document.getElementById('occasionView'); 
        var mc6 = new Hammer(occasionView);
        mc6.on("tap", function(ev){ 
            document.getElementById('tappedOcc').innerHTML = ev.target.innerHTML;
            //change contents of gifts-occ with a query before displaying the gifts-occ page
            loadPage('gifts-occ');
        });
    
    //GIFTS-PER
    var personGiftsPage = document.getElementById('gifts-for-person');
        var mc7 = new Hammer(personGiftsPage);
        mc7.on("swipeleft", function(){ loadPage('people') });
        mc7.on("swiperight",function(){ loadPage('people') });
    
    var btnAddPersGift = document.getElementById('btnAddPersGift');
        var mc8 = new Hammer(btnAddPersGift);
        mc8.on("tap", function(){ 
            document.getElementById('giftPerson').innerHTML = document.getElementById('tappedPers').innerHTML;
            loadModal('add-gift') 
        });
    
    var giftsPersonView = document.getElementById('giftsPersonView'); 
        var mc9 = new Hammer(giftsPersonView);
        mc9.on("tap", function(ev){ 
            if(ev.target.className == "purchased"){
                ev.target.className = "";
            }else{
                ev.target.className = "purchased";
            }
           
        });
        mc9.on("doubletap", function(ev){
            alert('query to delete the data-ref of '+ev.target.innerHTML);
            //app.delete(ev.target.id);
        });
    
    //GIFTS-OCC
    var occasionGiftsPage = document.getElementById('gifts-for-occasion');
        var mc10 = new Hammer(occasionGiftsPage);
        mc10.on("swipeleft", function(){ loadPage('occasion') });
        mc10.on("swiperight",function(){ loadPage('occasion') });
    
    var btnAddOccGift = document.getElementById('btnAddOccGift');
        var mc11 = new Hammer(btnAddOccGift);
        mc11.on("tap", function(){ 
            document.getElementById('giftOccasion').innerHTML = document.getElementById('tappedOcc').innerHTML;
            loadModal('add-gift-for-occ') 
            
            /*var occsname = results.rows.item(i).occ_name;
                                    msg = "<option value='" + i + "'>" + occsname + "</option>";
                                    occasionslist.innerHTML += msg;*/
        });
    
    var giftsOccasionView = document.getElementById('giftsOccasionView'); 
        var mc12 = new Hammer(giftsOccasionView);
        mc12.on("tap", function(ev){ 
            if(ev.target.className == "purchased"){
                ev.target.className = "";
            }else{
                ev.target.className = "purchased";
            }
            
        });
        mc12.on("doubletap", function(ev){
            alert('query to delete the data-ref of '+ev.target.innerHTML);
            //app.delete(ev.target.id);
        });
    
}
          
          
function loadPage(page){
    switch(page){
        case 'occasion': 
            document.getElementById('peoplePage').style.display="none";
            document.getElementById('occasionsPage').style.display="block";
            document.getElementById('gifts-for-person').style.display="none";
            document.getElementById('gifts-for-occasion').style.display="none";
            break;
        case 'people': 
            document.getElementById('peoplePage').style.display="block";
            document.getElementById('occasionsPage').style.display="none";
            document.getElementById('gifts-for-person').style.display="none";
            document.getElementById('gifts-for-occasion').style.display="none";
            break;
        case 'gifts-per': 
            document.getElementById('peoplePage').style.display="none";
            document.getElementById('occasionsPage').style.display="none";
            document.getElementById('gifts-for-person').style.display="block";
            document.getElementById('gifts-for-occasion').style.display="none";
            break;
        case 'gifts-occ': 
            document.getElementById('peoplePage').style.display="none";
            document.getElementById('occasionsPage').style.display="none";
            document.getElementById('gifts-for-person').style.display="none";
            document.getElementById('gifts-for-occasion').style.display="block";
            break;    
    }
}

function loadModal(modal){
    document.getElementById(modal).style.display="block";
    document.querySelector("[data-role=overlay]").style.display="block";
    /*
    switch(modal){
        case 'add-person': 
            document.getElementById(modal).style.display="block";
            document.querySelector("[data-role=overlay]").style.display="block";
            //var item = ev.target.getAttribute("data-ref");
            //var itemVal = ev.target.innerHTML;
            //document.getElementById("list").value = item;
            break;
        case 'add-occasion': 
            document.getElementById(modal).style.display="block";
            document.querySelector("[data-role=overlay]").style.display="block";
            break;
        case 'add-gift': 
            document.getElementById(modal).style.display="block";
            document.querySelector("[data-role=overlay]").style.display="block";
            break;  
        case 'add-gift-for-occ': 
            document.getElementById(modal).style.display="block";
            document.querySelector("[data-role=overlay]").style.display="block";
            break;
    }
    */
}





