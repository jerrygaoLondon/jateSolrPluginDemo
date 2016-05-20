(function ($) {

function hostReachable(url) {
  var reachable = true;
  $.ajax(url, {
	  statusCode: {
		0: function() {
		  alert('Connection Error. Please check your content store.');
		  reachable = false;
		  return false;
		},
		500: function() {
		  alert('Connection Error. Please check your content store.');
		  reachable = false;
		  return false;
		}
	  }
	});
	return true;
}

AjaxSolr.ResultWidget = AjaxSolr.AbstractWidget.extend({
  start: 0,
  
  beforeRequest: function () {    
	$(this.target).html($('<img>').attr('src', 'images/ajax-loader.gif'));
  },

  facetLinks: function (facet_field, facet_values) {
    var links = [];
    if (facet_values) {
      for (var i = 0, l = facet_values.length; i < l; i++) {
        if (facet_values[i] !== undefined) {
          links.push(
            $('<a href="#"></a>')
            .text(facet_values[i])
            .click(this.facetHandler(facet_field, facet_values[i]))
          );
        }
        else {
          links.push('no items found in current selection');
        }
      }
    }
    return links;
  },

  facetHandler: function (facet_field, facet_value) {
    var self = this;
    return function () {
      self.manager.store.remove('fq');
      self.manager.store.addByValue('fq', facet_field + ':' + AjaxSolr.Parameter.escapeValue(facet_value));
      self.doRequest(0);
      return false;
    };
  },

  afterRequest: function () {
    $(this.target).empty();
	
    for (var i = 0, l = this.manager.response.response.docs.length; i < l; i++) {
      var doc = this.manager.response.response.docs[i];
	  
      $(this.target).append(this.template(doc));

      var items = [];

      items = items.concat(this.facetLinks('jate_domain_terms', doc.jate_domain_terms));
	  // items = items.concat(this.facetLinks('url', doc.url));

      var $links = $('#links_' + doc.id);
      $links.empty();
      for (var j = 0, m = items.length; j < m; j++) {		  
        $links.append($('<li></li>').append(items[j]));
      }
    }
	//nicEditors.allTextAreas();
  },
/*
  template: function (doc) {
    var snippet = '';
    if (doc.text.length > 300) {
      snippet += doc.dateline + ' ' + doc.text.substring(0, 300);
      snippet += '<span style="display:none;">' + doc.text.substring(300);
      snippet += '</span> <a href="#" class="more">more</a>';
    }
    else {
      snippet += doc.dateline + ' ' + doc.text;
    }

    var output = '<div><h2>' + doc.title + '</h2>';
    output += '<p id="links_' + doc.id + '" class="links"></p>';
    output += '<p>' + snippet + '</p></div>';
    return output;
  },*/
  validURL: function(str) {
	  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
			  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
			  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
			  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
			  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
			  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
	  
	  if(!pattern.test(str)) {
		return false;
	  } else {
		return true;
	  }
  },
  template: function (doc) {
    var snippet = '';
	doc_text=String(doc.text)
	
    if (doc_text.length > 300) {
      //extract top tokens for brief description
	  var text_tokens=doc_text.split(" ", 200);
	  
	  var brief_desc=text_tokens.join(" ")
	  snippet += '<summary>' + brief_desc+'</summary>';
	  
	  snippet += '<span style="display:none;font-family: Verdana, Arial, Helvetica, sans-serif;white-space: pre-wrap; white-space: -moz-pre-wrap;white-space: -pre-wrap;white-space: -o-pre-wrap; word-wrap: break-word;">  <textarea cols="160" name="area1" rows="20"> ' + doc.text+'</textarea> </span>';
	  
	  snippet += ' <a href="#" class="more">more</a>';
    }
    else {
      snippet += doc.text;
    }
	
	//TODO: temporary, change afterwards

	var filename = "Undefined file title";
	if (doc.resourcename != undefined) {
		filename = doc.resourcename.replace(/^.*[\\\/]/, '')
	} else if (doc.title != undefined) {
		filename=doc.title
	} else if (doc.id != undefined && this.validURL(doc.id)) {
		filename = doc.id.replace(/^.*[\\\/]/, '')
	} else {
		filename = doc.id.replace(/^.*[\\\/]/, '')
	}
	
    var output = '<div><a href="'+doc.id+'" alt="document URL"><h2>' + filename + '</h2></a>';
    output += '<p id="links_' + doc.id + '" class="links"></p>';
    //output += '<a>' + doc.content + '</a></div>';
    output += '<p>' + snippet + '</p></div>';
	
    return output;
  },

  init: function () {
    $(document).on('click', 'a.more', function () {
      var $this = $(this),
          span = $this.parent().find('span');
		  summary = $this.parent().find('summary');
		  
      if (span.is(':visible')) {
        span.hide();
		summary.show()
        $this.text('more');
      }
      else {
        span.show();
		summary.hide()
        $this.text('less');		
      }

      return false;
    });
  }
});

})(jQuery);