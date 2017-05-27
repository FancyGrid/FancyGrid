

window.onerror = function(e, url, lineNumber, columnNumber, errorObject){
  $.ajax({
    type: 'POST',
    url: '/error/',
    data: {
      url: location.href,
      errorText: e,
      errorName: errorObject.name,
      errorMessage: errorObject.message,
      errorStack: errorObject.stack,
      lineNumber: lineNumber,
      columnNumber: columnNumber,
      userAgent: navigator.userAgent
    }
  });
};