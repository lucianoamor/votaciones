var apiKey = 'AIzaSyD9Qg1idI2ikXbpcPo51EEO8BMARtsfOvU';
var asuntos, votaciones;
function queryAsuntos(apiKey) {
    var FTAsuntosId = '1ELTXADIfpiUWfQfL9D8ia8p4VTw17UOoKXxsci4';
    var query = 'SELECT asuntoId, fecha, ausentes, afirmativos, negativos, abstenciones FROM ' + FTAsuntosId + ' ORDER BY fecha ASC';
    var encodedQuery = encodeURIComponent(query);
    var url = 'https://www.googleapis.com/fusiontables/v1/query?sql=' + encodedQuery + '&key=' + apiKey;
    $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function (data) {
            if(data.rows) {
                asuntos = data.rows.map(function(d) {
                    return {
                        id:     d[0],
                        fecha:  d[1],
                        au:     d[2],
                        af:     d[3],
                        ne:     d[4],
                        ab:     d[5]
                    }
                });
            }
            queryVotaciones(apiKey);
        }
    });
}
function queryVotaciones(apiKey) {
    var FTVotacionesId = '1GNJAVHF_7xPZFhTc_w4RLxcyiD_lAiYTgVlA0D8';
    var query = 'SELECT asuntoId, voto FROM ' + FTVotacionesId;
    var encodedQuery = encodeURIComponent(query);
    var url = 'https://www.googleapis.com/fusiontables/v1/query?sql=' + encodedQuery + '&key=' + apiKey;
    $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function (data) {
            if(data.rows) {
                votaciones = data.rows.map(function(d) {
                    return {
                        id:    d[0],
                        voto:  d[1]                }
                });
            }
            analizaDatos(asuntos, votaciones);
        }
    });
}
function analizaDatos(asuntos, votaciones) {
    for(var v in asuntos) {
        var statusAF,
            statusNE,
            statusAB,
            statusAU;
        var classAF = '';
        var classNE = '';
        var classAB = '';
        var classAU = '';
        var votacion = votaciones.filter(function(val) {
            return val.id == asuntos[v].id;
        });
        var af = votacion.filter(function(val) {
            return val.voto == 0;
        });
        if(af.length == asuntos[v].af)
            statusAF = 'OK';
        else {
            statusAF = af.length - asuntos[v].af;
            classAF = 'error';
        }
        var ne = votacion.filter(function(val) {
            return val.voto == 1;
        });
        if(ne.length == asuntos[v].ne)
            statusNE = 'OK';
        else {
            statusNE = ne.length - asuntos[v].ne;
            classNE = 'error';
        }
        var ab = votacion.filter(function(val) {
            return val.voto == 2;
        });
        if(ab.length == asuntos[v].ab)
            statusAB = 'OK';
        else {
            statusAB = ab.length - asuntos[v].ab;
            classAB = 'error';
        }
        var au = votacion.filter(function(val) {
            return val.voto == 3;
        });
        if(au.length == asuntos[v].au)
            statusAU = 'OK';
        else {
            statusAU = au.length - asuntos[v].au;
            classAU = 'error';
        }
        $('table').append('<tr><td>' + asuntos[v].id + '</td><td>' + asuntos[v].fecha + '</td><td class="' + classAF + '">' + statusAF + '</td><td class="' + classNE + '">' + statusNE + '</td><td class="' + classAB + '">' + statusAB + '</td><td class="' + classAU + '">' + statusAU + '</td></tr>');
    }
}
$(document).ready(function() {
   queryAsuntos(apiKey);
});