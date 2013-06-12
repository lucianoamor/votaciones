$(document).ready(function() {
    var apiKey = 'AIzaSyD9Qg1idI2ikXbpcPo51EEO8BMARtsfOvU';
    var FTAsuntosId = '1ELTXADIfpiUWfQfL9D8ia8p4VTw17UOoKXxsci4';
    var FTVotacionesId = '1KxXAg9YuF_r-1N_LAleR4QqKl4QZMHIeJh0EUf8';
    var dataVotacion;
    initializeSelects();
    createSelecAno();
    votacionesIni();
    $('#ano').change(function() {
        var ano = $('#ano option:selected').val();
        initializeSelects();
        if(ano != 0) {
            $(this).next('.loading').show();
            $('#fecha').addClass('disabled').attr('disabled', 'disabled');
            $('#fecha option:not(:first)').remove();
            $('#fecha').parents('.hero-unit').addClass('hero-no');
            FTQuery1(ano, apiKey, FTAsuntosId);
        }
    });
    $('#fecha').change(function() {
        var fecha = $('#fecha option:selected').val();
        initializeSelects2();
        if(fecha != 0) {
            $(this).next('.loading').show();
            $('#expediente').addClass('disabled').attr('disabled', 'disabled');
            $('#expediente option:not(:first)').remove();
            $('#expediente').parents('.hero-unit').addClass('hero-no');
            FTQuery2(fecha, apiKey, FTAsuntosId);
        }
    });
    $('#expediente').change(function() {
        var expediente = $('#expediente option:selected').val();
        initializeSelects3();
        if(expediente != 0) {
            $(this).next('.loading').show();
            FTQuery3(expediente, apiKey, FTAsuntosId, FTVotacionesId);
        }
    });
});
// funciones
function FTQuery1(ano, apiKey, FTAsuntosId) {
    var query = 'SELECT fecha FROM ' + FTAsuntosId + ' WHERE ano = ' + ano + ' GROUP BY fecha';
    var encodedQuery = encodeURIComponent(query);
    var url = 'https://www.googleapis.com/fusiontables/v1/query?sql=' + encodedQuery + '&key=' + apiKey;
    var arrayRows = [];
    $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function (data) {
            $('#ano').next('.loading').hide();
            if(data.rows) {
                $('#fecha').parents('.hero-unit').removeClass('hero-no').addClass('hero-ok');
                $('#fecha').removeClass('disabled').removeAttr('disabled');
                // paso objeto a array
                arrayRows = data.rows.map(function(e) {
                    return e[0]
                });
                // transformo en fecha Y-m-d para ordenar
                arrayRows = arrayRows.map(function(e) {
                    return dateToYMD(e);
                });
                // ordeno
                arrayRows.sort();
                // vuelvo a fecha d/m/Y
                arrayRows = arrayRows.map(function(e) {
                    return dateToDMY(e);
                });
                for(var v in arrayRows)
                    $('#fecha option:last').after('<option value="' + arrayRows[v] + '">' + arrayRows[v] + '</option>');
            }
            else
                $('#ano').nextAll('.output').show().html('No hay datos para ese año');
        }
    });
}
function FTQuery2(fecha, apiKey, FTAsuntosId) {
    var query = 'SELECT asuntoId, asunto, hora FROM ' + FTAsuntosId + ' WHERE fecha = \'' + fecha + '\' ORDER BY hora ASC';
    var encodedQuery = encodeURIComponent(query);
    var url = 'https://www.googleapis.com/fusiontables/v1/query?sql=' + encodedQuery + '&key=' + apiKey;
    $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function (data) {
            $('#fecha').next('.loading').hide();
            if(data.rows) {
                $('#expediente').parents('.hero-unit').removeClass('hero-no').addClass('hero-ok');
                $('#expediente').removeClass('disabled').removeAttr('disabled');
                for(var v in data.rows)
                    $('#expediente option:last').after('<option value="' + data.rows[v][0] + '">' + data.rows[v][1] + '</option>');
            }
            else
                $('#fecha').nextAll('.output').show().html('No hay datos para esa fecha');
        }
    });
}
function FTQuery3(expediente, apiKey, FTAsuntosId, FTVotacionesId) {
    var query = 'SELECT asuntoId, hora, base, mayoria, resultado, presidente, presentes, ausentes, abstenciones, afirmativos, negativos FROM ' + FTAsuntosId + ' WHERE asuntoId = ' + expediente;
    var encodedQuery = encodeURIComponent(query);
    var url = 'https://www.googleapis.com/fusiontables/v1/query?sql=' + encodedQuery + '&key=' + apiKey;
    $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function (data) {
            $('#expediente').next('.loading').hide();
            if(data.rows) {
                // muestro datos
                $('#datos-sesion').show();
                $('#presidente').html(data.rows[0][5]);
                $('#base').html(data.rows[0][2]);
                $('#mayoria').html(data.rows[0][3]);
                $('#resultado').html(data.rows[0][4]);
                $('#presentes').html(data.rows[0][6]);
                $('#ausentes').html(data.rows[0][7]);
                $('#afirmativos').html(data.rows[0][9]);
                $('#negativos').html(data.rows[0][10]);
                $('#abstenciones').html(data.rows[0][8]);
                // busco votacion
                FTQueryVotacion(data.rows[0][0], apiKey, FTVotacionesId);
            }
            else
                $('#expediente').nextAll('.output').show().html('Falló la consulta a Google Fusion Tables');
        }
    });
}
function FTQueryVotacion(asunto, apiKey, FTVotacionesId) {
    var query = 'SELECT diputadoId, bloqueId, voto FROM ' + FTVotacionesId + ' WHERE asuntoId = ' + asunto + ' ORDER BY bloqueId ASC';
    var encodedQuery = encodeURIComponent(query);
    var url = 'https://www.googleapis.com/fusiontables/v1/query?sql=' + encodedQuery + '&key=' + apiKey;
    $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function (data) {
            if(data.rows)
                votaciones(data.rows);
            else
                $('#expediente').nextAll('.output').show().html('Falló la consulta a Google Fusion Tables');
        }
    });
}
function initializeSelects() {
    $('#ano').parents('.hero-unit').addClass('hero-ok');
    $('#fecha').addClass('disabled').attr('disabled', 'disabled');
    $('#fecha').parents('.hero-unit').addClass('hero-no');
    $('#expediente').addClass('disabled').attr('disabled', 'disabled');
    $('#expediente option:not(:first)').remove();
    $('#expediente').parents('.hero-unit').addClass('hero-no');
    $('.loading').hide();
    $('.output').hide().html('');
    $('#datos-sesion').hide();
}
function initializeSelects2() {
    $('#expediente').addClass('disabled').attr('disabled', 'disabled');
    $('#expediente option:not(:first)').remove();
    $('#expediente').parents('.hero-unit').addClass('hero-no');
    $('.loading').hide();
    $('.output').hide().html('');
    $('#datos-sesion').hide();
}
function initializeSelects3() {
    $('.loading').hide();
    $('.output').hide().html('');
    $('#datos-sesion').hide();
}
function createSelecAno() {
    var date = new Date();
    var yearIni = 2003;
    for(var i = date.getFullYear() ; i >= yearIni ; i--)
        $('#ano option:last').after('<option value="' + i + '">' + i + '</option>');
}
function dateToYMD(date) {
    var dateObj = new Date(date);
    var mes = dateObj.getMonth()+1;
    if(mes < 10)
        mes = '0' + mes;
    var dia = dateObj.getDate();
    if(dia < 10)
        dia = '0' + dia;
    return dateObj.getFullYear() + '-' + mes + '-' + dia;
}
function dateToDMY(date) {
    var split = date.split('-');
    return split[2] + '/' + split[1] + '/' + split[0];
}
var svg;
var radio = 10;
var ancho = 870;
var maxDiputados = 260; // levantar de FT
var alto = Math.ceil(maxDiputados /  Math.ceil((ancho/2)/(radio*2))) * (radio*2) * 2;
var maxFila = Math.floor((ancho/2)/(radio*2))-1;
var color = new Array();
color[56] = '#0000FF';

function votacionesIni() {
    svg = d3.select('#cuadrantes').append('svg')
        .attr('width', ancho)
        .attr('height', alto)
        .append('g')
            .attr('transform', 'translate(10, 10)');
}
function votaciones(dataVotacion) {
    var posX = [0, 0, 0, 0];
    var posY = [0, 0, 0, 0];
    var fila = [0, 0, 0, 0];
    var dot = svg.selectAll('circle')
        .data(dataVotacion, function(d) {
            return d[0];
        });
    // enter
    dotEnter = dot.enter().insert('g')
        .attr('class', 'grupoDiputado');
    dotEnter.append('circle')
        .attr('r', 0)
        .attr('fill', '#dddddd')
        .attr('id', function(d) {
            return d[0];
        })
        .attr('title', function(d) {
            return '<h4>' + d[0] + '</h4><p>' + d[1] + '</p>';
        })
        .attr('data-toggle', 'tooltip');
    // exit
    dot.exit()
        .transition()
            .duration(1500)
            .attr('r', 0)
        .remove();
    // transition
    var grupoUpdate = svg.selectAll('.grupoDiputado')
      .transition()
        .duration(1500);
    grupoUpdate.selectAll('circle')
        .attr('cx', function(d) {
            var voto = d[2];
            var x, iniX;
            if(voto%2 == 0) // cuadrante 0 o 2
                iniX = 0;
            else
                iniX = ancho/2;
            if(posX[voto] > maxFila)
                posX[voto] = 0;
            x = iniX + ((radio*2) * posX[voto]);
            posX[voto]++;
            return x;
        })
        .attr('cy', function(d) {
            var voto = d[2];
            var y, iniY;
            if(voto < 2) // cuadrante 0 o 1
                iniY = 0;
            else
                iniY = alto/2;
            if(posY[voto] > maxFila) {
                fila[voto]++;
                posY[voto] = 0;
            }
            y = iniY + ((radio*2) * fila[voto]);
            posY[voto]++;
            return y;
        })
        .attr("r", radio-1)
        .attr('fill', function(d) {
            var bloque = d[1];
            if(color[bloque])
                return color[bloque];
            else
                return '#333333';
        });
    $('circle').tooltip({
        placement: 'bottom',
        container: 'body',
        html: true
    });
}