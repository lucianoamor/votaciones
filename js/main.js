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
    var query = 'SELECT asuntoId, asunto, base, mayoria, resultado, presidente, presentes, ausentes, abstenciones, afirmativos, negativos FROM ' + FTAsuntosId + ' WHERE asuntoId = ' + expediente;
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
                $('#cuadrantes').show();
                $('#cuadrantes-der').show();
                $('#asunto').html(data.rows[0][1]);
                $('#presidente').html(data.rows[0][5]);
                $('#base').html(data.rows[0][2]);
                $('#mayoria').html(data.rows[0][3]);
                $('#resultado').html(data.rows[0][4]);
                if(data.rows[0][4].toLowerCase() == "afirmativo")
                    $('#resultado').parent().addClass('badge-success');
                else
                    $('#resultado').parent().addClass('badge-important');
                var presentes = parseInt(data.rows[0][6], 10);
                var ausentes = parseInt(data.rows[0][7], 10);
                var afirmativos = parseInt(data.rows[0][9], 10);
                var negativos = parseInt(data.rows[0][10], 10);
                var abstenciones = parseInt(data.rows[0][8], 10);
                var total = presentes + ausentes;
                var afirmativosP = afirmativos/total;
                var negativosP = negativos/total;
                var abstencionesP = abstenciones/total;
                var ausentesP = ausentes/total;
                $('#presentes').html(presentes);
                $('#ausentes').html(ausentes);
                $('#afirmativos').html(afirmativos);
                $('#negativos').html(negativos);
                $('#abstenciones').html(abstenciones);
                $('#afirmativosP').html((afirmativosP*100).toFixed(2));
                $('#negativosP').html((negativosP*100).toFixed(2));
                $('#abstencionesP').html((abstencionesP*100).toFixed(2));
                $('#ausentesP').html((ausentesP*100).toFixed(2));
                var base100 = 268;
                $('.txt-afirmativos .grafico').css('width', base100*afirmativosP);
                $('.txt-negativos .grafico').css('width', base100*negativosP);
                $('.txt-abstenciones .grafico').css('width', base100*abstencionesP);
                $('.txt-ausentes .grafico').css('width', base100*ausentesP);
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
    $('#cuadrantes').hide();
    $('#cuadrantes-der').hide();
}
function initializeSelects2() {
    $('#expediente').addClass('disabled').attr('disabled', 'disabled');
    $('#expediente option:not(:first)').remove();
    $('#expediente').parents('.hero-unit').addClass('hero-no');
    $('.loading').hide();
    $('.output').hide().html('');
}
function initializeSelects3() {
    $('.loading').hide();
    $('.output').hide().html('');
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
var ancho = 860;
var maxDiputados = 260; // levantar de FT
var maxFila = Math.floor((ancho)/(radio*2));
var alto = Math.ceil(maxDiputados /  maxFila) * (radio*2) * 4;
maxFila--;
var color = new Array();
color[56] = '#0000FF';

function votacionesIni() {
    svg = d3.select('#cuadrantes').append('svg')
        .attr('width', ancho)
        .attr('height', alto)
      .append('g')
        .attr('transform', 'translate(0, 0)');
    svg.append('rect')
        .attr('x', '0')
        .attr('y', '0')
        .attr('width', ancho)
        .attr('height', alto/4)
        .attr('class', 'afirmativos');
    svg.append('rect')
        .attr('x', '0')
        .attr('y', alto/4)
        .attr('width', ancho)
        .attr('height', alto/4)
        .attr('class', 'negativos');
    svg.append('rect')
        .attr('x', '0')
        .attr('y', alto/2)
        .attr('width', ancho)
        .attr('height', alto/4)
        .attr('class', 'abstenciones');
    svg.append('rect')
        .attr('x', '0')
        .attr('y', (alto*3)/4)
        .attr('width', ancho)
        .attr('height', alto/4)
        .attr('class', 'ausentes');
    svg.append('line')
        .attr('x1', '0')
        .attr('y1', alto/4)
        .attr('x2', ancho)
        .attr('y2', alto/4)
        .attr('class', 'linea');
    svg.append('line')
        .attr('x1', '0')
        .attr('y1', alto/2)
        .attr('x2', ancho)
        .attr('y2', alto/2)
        .attr('class', 'linea');
    svg.append('line')
        .attr('x1', '0')
        .attr('y1', (alto*3)/4)
        .attr('x2', ancho)
        .attr('y2', (alto*3)/4)
        .attr('class', 'linea');
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
    dot.enter().append('circle')
        .attr('r', 0)
        .attr('fill', '#dddddd')
        .attr('title', function(d) {
            return '<h4>' + d[0] + '</h4><p>' + d[1] + '</p>';
        })
        .attr('data-toggle', 'tooltip');
    // exit
    dot.exit().remove();
    // transition
    var grupoUpdate = svg.selectAll('circle')
      .transition()
        .duration(1500)
        .attr('cx', function(d) {
            var voto = d[2];
            var x;
            if(posX[voto] > maxFila)
                posX[voto] = 0;
            x = (radio*2) * posX[voto];
            posX[voto]++;
            return x + radio;
        })
        .attr('cy', function(d) {
            var voto = d[2];
            var y;
            var iniY = voto * (alto/4);
            if(posY[voto] > maxFila) {
                fila[voto]++;
                posY[voto] = 0;
            }
            y = iniY + ((radio*2) * fila[voto]);
            posY[voto]++;
            return y + radio;
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