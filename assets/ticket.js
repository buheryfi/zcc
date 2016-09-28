var client = ZAFClient.init();
client.invoke('resize', { width: '100%', height: '400px' });

var fetchTargets = {
  url: '/api/v2/targets.json',
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
		    	targetId: "zcc_"+item.id,
		    	targetEmail: item.email
		    });
	    }
    }, targetsArray);

    client.get('ticket.tags').then(function (data) {
			var tagsArray = [];
	    _.each(data["ticket.tags"], function(item){
		    if ( item.indexOf("zcc_") > -1) {
		    	tagsArray.push({
			    	tagId: item
			    });
		    }
	    }, tagsArray);

	    _.each(tagsArray, function(item){
		    var targetEmail = _.findWhere(targetsArray, {targetId: item.tagId});
		    item.tagEmail = targetEmail.targetEmail;
	    }, targetsArray);
	    		   
	    var theData = {targets: targetsArray, tags: tagsArray};
			renderTemplate(theData);
    
    });

  });
};

getTargets();

renderTemplate = function(theData){
  var theTemplateScript = $("#targets").html();
  var theTemplate = Handlebars.compile(theTemplateScript);
  $("#target-container").html(theTemplate(theData));
  
  $(".add-zcc").click(function(){
    var tagValue = $(this).val();
		client.invoke('ticket.tags.add', tagValue).then(function() {
			getTargets();
		});
  });
  
  $(".remove-zcc").click(function(){
    var tagValue = $(this).val();
		client.invoke('ticket.tags.remove', tagValue).then(function(){
			getTargets();
		})   
	});
} 