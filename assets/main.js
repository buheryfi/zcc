var client = ZAFClient.init();
client.invoke('resize', { width: '100%', height: '1000px' });
$(document).ready(function(){
	
	var fetchTargets = {
    url: '/api/v2/targets.json',
    type: 'GET',
    dataType: 'json'
  };
  
  var fetchTriggers = {
    url: '/api/v2/triggers.json',
    type: 'GET',
    dataType: 'json'
  };  
 
  getTargets = function(){
    client.request(fetchTargets).then(function(data) {
			var targetsArray = [];
	    _.each(data.targets, function(item){
		    if ( item.title.indexOf("ZCC") > -1) {
		    	targetsArray.push({
			    	targetTitle: item.title,
			    	targetId: item.id
			    });
		    }
	    }, targetsArray);
	    var triggersArray = [];
	    client.request(fetchTriggers).then(function(data) {
		    _.each(data.triggers, function(item){
			    if ( item.title.indexOf("ZCC") > -1) {
				    var title = item.title.replace("ZCC Notification for ", "");
			    	triggersArray.push({
				    	triggerTitle: title,
				    	triggerId: item.id,
				    	targetId: item.actions[0].value[0]
				    });
			    }
		    }, this);
		    var theData = {triggers: triggersArray};
		    renderTemplate(theData);
  		});
  	});  
  };
  getTargets();

  
  $("#create-BCC").click(function(){
    var emailValue = $("#new-email-address").val();
		var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
    if ( !emailRegex.test(emailValue)) {
      throw "Invalid format: " + emailValue;
    } 
    var targetPayload = {
      target: {
	      type: "email_target",
	      title: `ZCC Target: ${emailValue}`,
	      email: `${emailValue}`,
	      subject: `ZCC Target for ${emailValue}`
      }
    };
    var createTargetRequest = {
      url: 'https://z3nburmaglot.zendesk.com/api/v2/targets.json',
	    type: 'POST',
	    dataType: 'json',
	    contentType: 'application/json',
	    data: JSON.stringify(targetPayload)
    }; 
    
               
    client.request(createTargetRequest).then(function(targetData){

			var actionsValue = [{
					field: "notification_target", 
					value: [targetData.target.id, "This email is an automated notification; please do not reply. </br> {{ticket.comments_formatted}}"]
				}];
	
			var triggerPayload = {
				trigger: {
					title: `ZCC Notification for ${emailValue}`, 
					all: [{ "field": "current_tags", "operator": "includes", "value": `zcc_${targetData.target.id}`}], 
					actions: actionsValue
				}
			};
			
			var createTriggerRequest = {
	      url: 'https://z3nburmaglot.zendesk.com/api/v2/triggers.json',
		    type: 'POST',
		    dataType: 'json',
		    contentType: 'application/json',
		    data: JSON.stringify(triggerPayload)
      }; 
      		      
      client.request(createTriggerRequest).then(function(triggerData){
				getTargets();
      });
  	});
  
  });
  
  renderTemplate = function(theData){
    var theTemplateScript = $("#targets").html();
    var theTemplate = Handlebars.compile(theTemplateScript);
    console.log(theData);
    $("#target-list").html(theTemplate(theData));
    $(".remove-zcc").click(function(){
	    var triggerId = $(this).val();
	    var targetId = $(this).data( "targetId");
	    var deleteTriggerRequest = {
	      url: 'https://z3nburmaglot.zendesk.com/api/v2/triggers/'+triggerId+'.json',
		    type: 'DELETE'
      }; 
      var deleteTargetRequest = {
	      url: 'https://z3nburmaglot.zendesk.com/api/v2/targets/'+targetId+'.json',
		    type: 'DELETE'
      }; 
      
      client.request(deleteTriggerRequest).then(function(triggerData){
				client.request(deleteTargetRequest).then(function(targetData){
					getTargets();
      	});
      }); 
    });
  } 
  
});