$(document).ready(function() {
    var apiKey = 'AIzaSyD9Qg1idI2ikXbpcPo51EEO8BMARtsfOvU';
    var FTAsuntosId = '1ELTXADIfpiUWfQfL9D8ia8p4VTw17UOoKXxsci4';
    initializeSelects();
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
            FTQuery3(expediente, apiKey, FTAsuntosId);
        }
    });
});
// funciones
function FTQuery1(ano, apiKey, FTAsuntosId) {
    var query = 'SELECT fecha FROM ' + FTAsuntosId + ' WHERE ano = ' + ano;
    var encodedQuery = encodeURIComponent(query);
    var url = 'https://www.googleapis.com/fusiontables/v1/query?sql=' + encodedQuery + '&key=' + apiKey;
    var arrayRows = [];
    $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function (data) {
            // paso objeto a array
            arrayRows = data.rows.map(function(e) {
                return e[0]
            });
            // borro valores repetidos
            arrayRows = arrayRows.filter(function(e, i, array) {
                return i == array.lastIndexOf(e);
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
            if(arrayRows.length > 0) {
                $('#ano').next('.loading').hide();
                $('#fecha').parents('.hero-unit').removeClass('hero-no').addClass('hero-ok');
                $('#fecha').removeClass('disabled').removeAttr('disabled');
                for(var v in arrayRows)
                    $('#fecha option:last').after('<option value="' + arrayRows[v] + '">' + arrayRows[v] + '</option>');
            }
            else
                $('#ano').nextAll('.output').show().html('Falló la consulta a Google Fusion Tables');
        }
    });
}
function FTQuery2(fecha, apiKey, FTAsuntosId) {
    var query = 'SELECT \'\ufeffasuntoId\', asunto, hora FROM ' + FTAsuntosId + ' WHERE fecha = \'' + fecha + '\' ORDER BY hora ASC';
    var encodedQuery = encodeURIComponent(query);
    var url = 'https://www.googleapis.com/fusiontables/v1/query?sql=' + encodedQuery + '&key=' + apiKey;
    var arrayRows = [];
    $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function (data) {
            if(data.rows.length > 0) {
                $('#fecha').next('.loading').hide();
                $('#expediente').parents('.hero-unit').removeClass('hero-no').addClass('hero-ok');
                $('#expediente').removeClass('disabled').removeAttr('disabled');
                for(var v in data.rows)
                    $('#expediente option:last').after('<option value="' + data.rows[v][0] + '">' + data.rows[v][1] + '</option>');
            }
            else
                $('#fecha').nextAll('.output').show().html('Falló la consulta a Google Fusion Tables');
        }
    });
}
function FTQuery3(expediente, apiKey, FTAsuntosId) {
    var query = 'SELECT \'\ufeffasuntoId\', hora, base, mayoria, resultado, presidente, presentes, ausentes, abstenciones, afirmativos, negativos FROM ' + FTAsuntosId + ' WHERE \'\ufeffasuntoId\' = ' + expediente;
    var encodedQuery = encodeURIComponent(query);
    var url = 'https://www.googleapis.com/fusiontables/v1/query?sql=' + encodedQuery + '&key=' + apiKey;
    var arrayRows = [];
    $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function (data) {
            if(data.rows.length > 0) {
                $('#expediente').next('.loading').hide();
                $('#data').html(data.rows[0][2]);
            }
            else
                $('#expediente').nextAll('.output').show().html('Falló la consulta a Google Fusion Tables');
        }
    });
}
function initializeSelects() {
    var date = new Date();
    var yearIni = 2003;
    for(var i = date.getFullYear() ; i >= yearIni ; i--)
        $('#ano option:last').after('<option value="' + i + '">' + i + '</option>');
    $('#ano').parents('.hero-unit').addClass('hero-ok');
    $('#fecha').addClass('disabled').attr('disabled', 'disabled');
    $('#fecha option:not(:first)').remove();
    $('#fecha').parents('.hero-unit').addClass('hero-no');
    $('#expediente').addClass('disabled').attr('disabled', 'disabled');
    $('#expediente option:not(:first)').remove();
    $('#expediente').parents('.hero-unit').addClass('hero-no');
    $('.loading').hide();
    $('.output').hide().html('');
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
function dateToYMD(date) {
    var split = date.split('/');
    return split[2] + '-' + split[1] + '-' + split[0];
}
function dateToDMY(date) {
    var split = date.split('-');
    return split[2] + '/' + split[1] + '/' + split[0];
}