function MessageBox(txt) {
	$('.message_box').html( txt);
}

function isInteger(txtInteger) {
	if (txtInteger.match(/^\d+$/) === null) {
		return false;
	}
	return true;
}

function isDate(txtDate) {
	var currVal = txtDate;
	if(currVal == '')
	    return false;
	  
	//Declare Regex  
	var rxDatePattern = /^(\d{4})(\/|-)(\d{1,2})(\/|-)(\d{1,2})$/; 
	var dtArray = currVal.match(rxDatePattern); // is format OK?

	if (dtArray == null)
		return false;
  
		  //Checks for YYYY-MM-DD format.
	  dtYear = dtArray[1];
	  dtMonth = dtArray[3];
	  dtDay= dtArray[5];
	  

	  if (dtMonth < 1 || dtMonth > 12)
	      return false;
	  else if (dtDay < 1 || dtDay> 31)
	      return false;
	  else if ((dtMonth==4 || dtMonth==6 || dtMonth==9 || dtMonth==11) && dtDay ==31)
	      return false;
	  else if (dtMonth == 2)
	  {
	     var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
	     if (dtDay> 29 || (dtDay ==29 && !isleap))
	          return false;
	  }
	  return true;
	}

function dateFormat (value)
{
	if (value == null) {
		return '-';
	}
	var rxDatePattern = /^(\S{10})\T(\S{8})/; 
	var dtArray = value.match(rxDatePattern); 
	return dtArray[1]; //+' '+dtArray[2]; 
}

function save(model, id, obj) {
 	$.ajax({
        url: '/rest_api/'+model+'/'+id+'/',
        global: false,
        type: 'POST',
        data: {_method: "PUT", _content_type: "application/json", _content:obj, csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()},
        dataType: "json",
        success: function(data) { 
  //      		console.log('OK!');	    	     	
         } 
 	});
}

function models_list() {	
 	$.ajax({
        url: '/rest_api/?format=json',
        type: 'GET',
        dataType: "json",
        success: function(data) { 
        	for (var model in data) {
        		$('#m_list').append('<li><a href="#">'+model+'</a></li>');
        	} 
    		$('#m_list').click(function(e) {
    			get_model_structure(e);
    		});        	       	
         } 
 	});
}

function isValid(fields) {
	var err_message = '';
	var result  = fields.length;
	for (i = 0; i < fields.length; i++) {
		var type = $(fields[i]).attr("field-type");
		
		if (type == 'datetime') {
			
			if (!isDate(fields[i].value)) {
				err_message += '<p>"' + fields[i].value + '" is incorrect date value. Please enter a date in the format YYYY-MM-DD.</p>';
				$(fields[i]).attr('style', 'background-color:red;')
				
			} else {
				result -= 1
				$(fields[i]).removeAttr('style');
//				console.log('========= datetime');
			}		
			
		} else if (type == 'integer') {
			
			if (!isInteger(fields[i].value)) {
				err_message += '<p>"' + fields[i].value + '" is incorrect integer value. Please enter a numeric value.</p>';
				$(fields[i]).attr('style', 'background-color:red;')
				
			} else {
				result -= 1
				$(fields[i]).removeAttr('style');
//				console.log('========= integer');
			}
		} else {
			result -= 1
//			console.log('========= string');
		}
	}

	if (result == 0) {
		MessageBox('');
		return true;
	} else {
		MessageBox(err_message);
		return false;
	}
	
}

function on_focusout_datepicker(dateText, inst){
	if ($(inst.input[0]).attr('class') == 'new_row datepicker hasDatepicker'){
		return;
	}
	$(inst.input[0]).prop("disabled", true);
	}

function on_focusout(e){  	
	$(e.target).prop("disabled", true);  

	}

function on_click(e) {       		

		if ($(e.target).attr("disabled")) {
    			$(e.target).prop("disabled", false);
    			$(e.target).focus();

			}   		
	}
	
function on_change(e, model) {   
	console.log('on_change');
	console.log($(e.currentTarget)); 
		var kids = e.currentTarget.childNodes;		
		var ent='{'
		fs = [];
		for (var i in kids) {
			var k = kids[i].firstChild;
			if ($(k).attr('field')) {
				if (ent != '{') {
					ent += ',\n'
				}      						
				fs[i] = k;
    			if ($(k).attr('field-type') =='datetime') {
    				v = k.value + ' 00:00:00';
    			} else {
    				v = k.value;
    			}          				
    			ent += '"'+$(k).attr('field')+'": "'+v+'"';
			}	
		}
		ent += '}';
		if (!isValid(fs)){ 				
    			return;
    		}
	
		//console.log($(e.currentTarget)); 
		if ($(e.currentTarget).attr('id')) {
			save(model, $(e.currentTarget).attr('id'), ent);          		
		}
	}

function get_model_value(model, attributes) {
 	$.ajax({
        url: '/rest_api/'+model+'/?format=json',
        type: 'GET',
        dataType: "json",
        success: function(data) {    
        //	console.log('model_view_success');
        	model_view_success(data, model, attributes);
          } 
 	});	
}

function model_view_success(data, model, attributes) {
	var html = '<table id="list_table" border=1><caption>'+model+'</caption><tr>'
	var html_new = '<table border=0><caption>New Record</caption>'
	for (var i in attributes) {
		html += '<th class="t_header" r_only="'+attributes[i].read_only+'" type="'+attributes[i].type+'">'+attributes[i].label+'</th>'
		if (i != 'id') {
			if (attributes[i].type == "datetime") {
				var cl = 'new_row datepicker'
			} else {
				var cl = 'new_row'
			} 
			html_new += '<tr><td>'+attributes[i].label+'</td><td><input class="'+cl+'" type="text" field="'+i+'" field-type="'+attributes[i].type+'"></td></tr>'
		}
 	}        	
	html += '</tr>'     	
	for (var i in data) {
		html += '<tr class="records" id='+data[i]['id']+'>'
			for (var k in data[i]) {
				if (attributes[k].read_only == true){
					html += '<td>'+data[i][k]+'</td>'
				} else {
					if (attributes[k].type == "datetime") {
						var v = dateFormat(data[i][k])
						var cl = 'row datepicker'
					} else {
						v = data[i][k]
						var cl = 'row'
					}
					html += '<td><input class="'+cl+'" id="'+data[i]['id']+'_'+k+'" type="text" field="'+k+'" field-type="'+attributes[k].type+'" value="'+v+'"disabled></td>'       					
				}
			}
		html += '</tr>'    	
	}
	
	html += '</table>'
	html_new += '</table><button model="'+model+'" id="btSave">Save</button>'
		
	$(".model_content").html(html+'<br>'+html_new);
	
	$('#btSave').click(function(e){  

		var elements = document.getElementsByClassName('new_row');		
		if (!isValid(elements)){
			//console.log('no valid data');
			return;
		}        		
		
		var ent='{'
		for (i = 0; i < elements.length; i++) {
			
			if (ent != '{') {
				ent += ',\n'
			}    
			if ($(elements[i]).attr('field-type') =='datetime') {
				v = elements[i].value + ' 00:00:00';
			} else {
				v = elements[i].value;
			}  
			ent += '"'+$(elements[i]).attr('field')+'": "'+v+'"';

		}
		ent += '}';
		
	 	$.ajax({
	        url: '/rest_api/'+$(e.currentTarget).attr('model')+'/?format=json',
	        global: false,
	        type: 'POST',
	        data: {_content_type: "application/json", _content:ent, csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()},
	        dataType: "json",
	        success: function(data) {
	        	new_record_success(e, data, model);
	        }
	 	});          		
    	});
	

	$('tr').bind('click', (function(e){on_click(e)}));       	
	$('.row').bind('focusout', (function(e){on_focusout(e)}));
	$('.records').bind('change', (function(e){on_change(e, model)}));
	$(function() {$( ".datepicker" ).datepicker({ dateFormat: 'yy-mm-dd', beforeShow: function (input, inst) {
	    $(this).off('focusout');
	 },onClose: function (dateText, inst) {
	     $(this).on('focusout',on_focusout_datepicker(dateText, inst));
	 }}			
	);});  
	
}

function new_record_success(e, data, model) {
	var attributes = document.getElementsByClassName('t_header');
	var html ='<tr class="records" id='+data['id']+'>'		
		var k = 0
    	for (var i in data) {
    				if (i == 'id') {
    					html += '<td>'+data[i]+'</td>';
    				} else {					
    					if ($(attributes[k]).attr("type") == "datetime") {
    						var v = dateFormat(data[i]);
    						var cl = 'datepicker'
    					} else {
    						var v = data[i];
    						var cl = 'row'
    					} 
    				html += '<td><input class="'+cl+'" id="'+data['id']+'_'+i+'" type="text" field="'+i+'" field-type="'+$(attributes[k]).attr("type")+'" value="'+v+'"disabled></td>';  				
    				}
    				k += 1;    	     	
    		} 
		html += '</tr>';
				
		$("#list_table").append(html);
		
        $('tr').bind('click', (function(e){on_click(e)}));       	
        $('.row').bind('focusout', (function(e){on_focusout(e)}));
        $('.records').bind('change', (function(e){on_change(e, model)}));
    	$(function() {$( ".datepicker" ).datepicker({ dateFormat: 'yy-mm-dd', beforeShow: function (input, inst) {
    	    $(this).off('focusout');
    	 },onClose: function (dateText, inst) {
    	     $(this).on('focusout',on_focusout_datepicker(dateText, inst));
    	 }}			
    	);});  	
}


function get_model_structure(e) {
	var model = e.target.innerHTML;	
	console.log(model);
 	$.ajax({
        url: '/rest_api/'+model+'/?format=json',
        global: false,
        type: 'OPTIONS',
        dataType: "json",
        success: function(data) {  
        	MessageBox('');
        	get_model_value(model, data.actions.POST); 
//        	console.log(data.actions.POST);
         } 
 	});	
}




