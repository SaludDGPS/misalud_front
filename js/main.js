var GobMXMiSalud    = {
    init            : function () {
        moment.locale( 'es' );

        GobMXMiSalud.setupCalendar();
        GobMXMiSalud.setupCustomSelect();
        GobMXMiSalud.setupRegister();
        GobMXMiSalud.setupVideoModal();
    },

    setupCalendar   : function () {
        var pickerOpts  = {
            format              : 'DD/MM/YYYY',
            collapse            : false,
            allowInputToggle    : true,
            tooltips: {
                selectMonth: 'Selecciona un mes',
                prevMonth: 'Mes anterior',
                nextMonth: 'Mes siguiente',
                selectYear: 'Selecciona un año',
                prevYear: 'Año anterior',
                nextYear: 'Año siguiente',
            }
        };

        var jQ          = $;
        var messages    = $( '#messages-container .messages' );
        var mobileMessages = $('#mobile-messages .messages');
        var setData     = function ( dateSet, ignoreDueDate ) {
            // Define el valor de ignoreDueDate desde la función en vez que desde el atributo
            ignoreDueDate = ignoreDueDate === undefined || ignoreDueDate === false ? false : true;

            $.getJSON( 'data/misalud.json', function ( data ) {
                function getFlow(nameFlow) {
                    var color = '#000000';
                    var name = '';

                    if ( nameFlow.indexOf( 'consejo' ) != -1 || nameFlow.indexOf( 'milk' ) != -1 ||
                        nameFlow.indexOf( 'mosquitos' ) != -1 || nameFlow.indexOf( 'nutrition' ) != -1 ||
                        nameFlow.indexOf( 'development' ) != -1 || nameFlow.indexOf( 'extra' ) != -1 ||
                        nameFlow.indexOf( 'lineaMaterna' ) != -1 || nameFlow.indexOf( 'labor' ) != -1 ) { // consejos
                        color = '#2bd6ce';
                        name = "Consejo";
                    } else if ( nameFlow.indexOf( 'reto' ) != -1 ) { // retos
                        color = '#da48ef';
                        name = "Reto";
                    } else if ( nameFlow.indexOf( 'reminders' ) != -1 || nameFlow.indexOf( 'freePD' ) != -1 ||
                        nameFlow.indexOf( 'getBirth' ) != -1 || nameFlow.indexOf( 'miAlerta' ) != -1 ) { // recordatorios
                        color = '#8de530';
                        name = "Recordatorios";
                    } else if ( nameFlow.indexOf( 'planning' ) != -1 || nameFlow.indexOf( 'miAlerta_followUp' ) != -1 || nameFlow.indexOf( 'miAlta' ) != -1 ) { // planificacion
                        color = '#f4e52c';
                        name = "Planificación";
                    } else if ( nameFlow.indexOf( 'incentives' ) != -1 ) { // incentivos
                        color = '#986ae2';
                        name = "Incentivos";
                    } else if ( nameFlow.indexOf( 'prevent' ) != -1 || nameFlow.indexOf( 'concerns' ) != -1 ||
                                nameFlow.indexOf( 'miscarriage' ) != -1 || nameFlow.indexOf( 'prematuro' ) != -1 ) { // preocupaciones
                        color = '#f9a35d';
                        name = "Preocupaciones";
                    }

                    return {
                        color: color,
                        name: name
                    }
                }
                var valid           = _.filter( data, function ( d ) {
                        return d.flow != 'null' && ( !ignoreDueDate || ( ignoreDueDate && d.relative_to != 'rp_duedate' ) );
                    }),
                    types           = _.uniq( _.pluck( valid, 'relative_to' ) );
                    calendarData    = _.map( valid, function ( v, i ) {
                        var flowDate    = moment( dateSet ).add( v.offset, 'days' );

                        var flow    = getFlow( v.flow_name );

                        return {
                            id          : v.flow,
                            color       : flow.color,
                            name        : v.flow,
                            startDate   : flowDate.toDate(),
                            type        : flow.name,
                            endDate     : flowDate.add( 1, 'days' ).toDate()
                        }
                    }),
                    vars_replace    = {
                        '@contact.rp_babyname'          : 'tu bebe',
                        '@contact.rp_apptdate'          : moment( dateSet ).add( 5, 'days' ).format( 'dddd, MMMM Do' ),
                        '@contact.rp_duedate'           : moment( dateSet ).format( 'dddd, MMMM Do' ),
                        '@contact.rp_name'              : 'Maria',
                        '@contact.rp_planhospital'      : 'Clinica de salud',
                        '@contact.tel_e164'             : 'tel_e164',
                        '@contact.rp_alerta_time'       : moment().format( 'dddd, MMMM Do, h:mm' ),
                        '@contact.rp_deliverydate'      : moment( dateSet ).format( 'dddd, MMMM Do' ),
                        '@contact.rp_duedate'           : moment( dateSet ).format( 'dddd, MMMM Do' ),
                        '@contact.rp_mialerta_time'     : moment().format( 'dddd, MMMM Do, h:mm' ),
                        '@contact.rp_mialta_apptdate'   : moment( dateSet ).add( 5, 'days' ).format( 'dddd, MMMM Do' ),
                        '@contact.rp_mialta_duedate'    : moment().format( 'dddd, MMMM Do' ),
                        '@contact.rp_mialta_init'       : moment().format( 'dddd, MMMM Do' ),
                    };

                // Mobile version
                var mobileContainer         = $( '#message-panel' );
                if ( mobileContainer.length > 0 ) {
                    var mobileMessagesData  = _.sortBy( calendarData, 'startDate' ),
                        activeIndex         = 0,
                        setMobileData       = function ( index ) {
                            $.getJSON( 'data/flows/' + mobileMessagesData[index].id + '.json', function ( flow ) {
                                var actions_sets    = flow.flows[0].action_sets,
                                    msg             = actions_sets[0].actions[0].msg.spa;

                                for ( var key in vars_replace ) {
                                    msg     = msg.split( key ).join( vars_replace[key] );
                                }


                                $( '.panel-heading', mobileContainer ).css( 'background-color', mobileMessagesData[index].color ).html( mobileMessagesData[index].type );
                                $( '.panel-body', mobileContainer ).html( msg );
                            });
                        };

                    setMobileData( activeIndex );

                    function getNextMessage() {
                        var filtered    = _.filter( mobileMessagesData, function ( m ) {
                            return m.startDate > mobileMessagesData[ activeIndex ].startDate;
                        });

                        activeIndex     = _.findIndex( mobileMessagesData, function ( d ) {
                            return d.id == filtered[0].id;
                        });

                        setMobileData( activeIndex );
                    }

                    function getPreviousMessage() {
                        var filtered    = _.filter( mobileMessagesData, function ( m ) {
                            return m.startDate < mobileMessagesData[ activeIndex ].startDate;
                        });

                        var prevDay     = _.filter( filtered, function ( m ) {
                            return m.startDate == filtered[ filtered.length - 1 ].startDate;
                        });

                        if ( prevDay.length ) {
                            activeIndex     = _.findIndex( mobileMessagesData, function ( d ) {
                                return d.id == prevDay[0].id;
                            });

                            setMobileData( activeIndex );
                        }
                    }

                    $( '#mobile-control-left' ).click( function ( e ) {
                        e.preventDefault();
                        getPreviousMessage();
                    });
                    $( '#mobile-control-right' ).click( function ( e ) {
                        e.preventDefault();
                        getNextMessage();
                    });

                    var touchStartCoords =  {'x':-1, 'y':-1}, // X and Y coordinates on mousedown or touchstart events.
                    touchEndCoords = {'x':-1, 'y':-1},// X and Y coordinates on mouseup or touchend events.
                    direction = 'undefined',// Swipe direction
                    minDistanceXAxis = 30,// Min distance on mousemove or touchmove on the X axis
                    maxDistanceYAxis = 30,// Max distance on mousemove or touchmove on the Y axis
                    maxAllowedTime = 1000,// Max allowed time between swipeStart and swipeEnd
                    startTime = 0,// Time on swipeStart
                    elapsedTime = 0,// Elapsed time between swipeStart and swipeEnd
                    targetElement = document.getElementById('message-panel');// Element to delegate

                    function swipeStart(e) {
                        e = e ? e : window.event;
                        e = ('changedTouches' in e)?e.changedTouches[0] : e;
                        touchStartCoords = {'x':e.pageX, 'y':e.pageY};
                        startTime = new Date().getTime();
                    }

                    function swipeMove(e){
                        e = e ? e : window.event;
                        e.preventDefault();
                    }

                    function swipeEnd(e) {
                        e = e ? e : window.event;
                        e = ('changedTouches' in e)?e.changedTouches[0] : e;
                        touchEndCoords = {'x':e.pageX - touchStartCoords.x, 'y':e.pageY - touchStartCoords.y};
                        elapsedTime = new Date().getTime() - startTime;
                        if (elapsedTime <= maxAllowedTime){
                            if (Math.abs(touchEndCoords.x) >= minDistanceXAxis && Math.abs(touchEndCoords.y) <= maxDistanceYAxis){
                                direction = (touchEndCoords.x < 0)? 'left' : 'right';
                                switch(direction){
                                case 'left':
                                    getNextMessage();
                                    break;
                                case 'right':
                                    getPreviousMessage();
                                    break;
                                }
                            }
                        }
                    }

                    function addMultipleListeners(el, s, fn) {
                        var evts = s.split(' ');
                        for (var i=0, iLen=evts.length; i<iLen; i++) {
                        el.addEventListener(evts[i], fn, false);
                        }
                    }

                    addMultipleListeners(targetElement, 'mousedown touchstart', swipeStart);
                    addMultipleListeners(targetElement, 'mousemove touchmove', swipeMove);
                    addMultipleListeners(targetElement, 'mouseup touchend', swipeEnd);
                }

                function selectDay(e) {
                    // Muestra el teléfono en el móvil
                    if ($(window).width() > 570) {
                        $('#simulator-phone').css('display', 'block');
                    }

                    if ( e.events && e.events.length > 0 ) {
                        var id      = e.events[0].id,
                            form    = $( '#chat-form' )
                            recentScroll = messages.height();

                        form.fadeOut();
                        form.unbind( 'submit' );
                        $.getJSON( 'data/flows/' + id + '.json', function ( flow ) {
                            var actions_sets    = flow.flows[0].action_sets,
                                rules           = flow.flows[0].rule_sets && Array.isArray( flow.flows[0].rule_sets ) && flow.flows[0].rule_sets.length > 0 && flow.flows[0].rule_sets[0].rules;
                            var msg             = "";
                            var mobFlowName = flow.flows[0].metadata.name;
                            var to_append = "";
                            var mob_to_append = "";
                            for (var i = 0; i < actions_sets[0].actions.length; i++) {
                                msg              = actions_sets[0].actions[i].msg.spa;
                                for ( var key in vars_replace ) {
                                    msg     = msg.split( key ).join( vars_replace[key] );
                                }
                                to_append += '<div class="message"><p>' + msg + '</p>'+"</div>";
                                mob_to_append += '<div class="message"><p style="background-color: '+ getFlow(mobFlowName).color +'">' + getFlow(mobFlowName).name + '</p><p>' + msg + '</p>'+"</div>";
                            }
                            messages.html( $( to_append));
                            mobileMessages.html($(mob_to_append));
                            if ( actions_sets.length > 0 ) {
                                form.fadeIn();
                                $('#chat-input').focus();
                                form.on( 'submit', function ( e ) {
                                    e.preventDefault();
                                    var response    = $( '#chat-input' ).val();

                                    if ( response && response != '' ) {
                                        var evaluated   = false;
                                        messages.append( $( '<div class="message response-message"><p>' + response + '</p></div>' ) );
                                        $( '#chat-input' ).val( '' );

                                        recentScroll += 999
                                        messages.animate({
                                            scrollTop: recentScroll
                                        });

                                        _.each( rules, function ( r ) {
                                            if ( evaluated ) return;

                                            var supported   = r.test && r.test.test && r.test.test.spa.split( ' ' );
                                            if ( supported.indexOf( response.toLowerCase() ) != -1 ) {
                                                evaluated   = true;

                                                var system_r    = _.find( actions_sets, function ( a ) {
                                                        return a.uuid == r.destination;
                                                    }),
                                                    system_msg  = system_r.actions[0].msg.spa;
                                                for ( var key in vars_replace ) {
                                                    system_msg  = system_msg.split( key ).join( vars_replace[key] );
                                                }

                                                messages.append( $( '<div class="message"><p>' + system_msg + '</p></div>' ) );
                                                mobileMessages.append( $( '<div class="message"><p>' + system_msg + '</p></div>' ) );

                                                recentScroll += 999
                                                messages.animate({
                                                    scrollTop: recentScroll
                                                });
                                            }
                                        });
                                    }

                                    return false;
                                });
                            }
                        });
                    }
                }

                if ($(window).width() < 571) {
                    jQ( '#tryit-calendar' ).calendar({
                        language: 'es',
                        startMonth: initMonth,
                        endMonth: lastMonth,
                        clickDay: function(ev) {
                            selectDay(ev);
                        },
                        dataSource: calendarData
                    });
                } else {
                    jQ( '#tryit-calendar' ).calendar({
                        language    : 'es',
                        startMonth  : initMonth,
                        clickDay    : function(ev) {
                            selectDay(ev);
                        },
                        dataSource  : calendarData
                    });
                }
                $( '#tryit-tool-container' ).fadeIn( function () {
                    if ( $( window ).width() > 761 ) {
                        var element         = $( '#simulator-phone' ),
                            elementHeight   = element.height(),
                            parentHeight    = $( '#tryit-calendar' ).height() + 50,
                            originalY       = element.offset().top,
                            footer          = $('footer');

                        // Space between element and top of screen (when scrolling)
                        var topMargin   = 100;

                        // Should probably be set in CSS; but here just for emphasis
                        element.css( 'position', 'relative' );

                        $( window ).on( 'scroll', function() {
                            var scrollTop = $( window ).scrollTop();
                            if (scrollTop > (footer.offset().top - footer.height())) {
                                return;
                            }

                            element.stop( false, false ).animate({
                                top     : ( scrollTop < originalY ) ? 0 : scrollTop - originalY + topMargin
                            }, 120 );
                        });
                    }
                });
            });
        };
        var date_period     = $( '#date-period-picker' ).datetimepicker( pickerOpts );
        var date_baby       = $( '#date-baby-picker' ).datetimepicker( pickerOpts );
        var date_baby_alt   = $( '#date-baby-alt-picker' ).datetimepicker( pickerOpts );
        var initMonth = 0;
        var lastMonth = 1;

        $( '.control-calendar' ).click( function ( e ) {
            var $el     = $( e.currentTarget ),
                type    = $el.data( 'type' );

            if ( $el.hasClass( 'active' ) ) return;

            $( '.control-calendar.active' ).removeClass( 'active' );
            $el.addClass( 'active' );

            if ( type == 'pregnant' ) {
                $( '#datepickers_baby' ).css({
                    position    : 'absolute',
                    opacity     : 0,
                    display: 'none'
                });
                $( '#datepickers_pregnant' ).css({
                    position    : 'relative',
                    opacity     : 1,
                    display: 'block'
                });

                date_period.on( 'dp.change', function ( e ) {
                    // No permite seleccionar fechas futuras
                    date_period.data('DateTimePicker').maxDate(new Date());
                    $( '#date-baby' ).val( '' );

                    setData( moment( e.date._d ).add( 280, 'days' ).toDate() );
                    initMonth = moment(e.date._d).add(67,'days').toDate().getMonth();
                    lastMonth = initMonth + 1;
                });
                date_baby.on( 'dp.change', function ( e ) {
                    $( '#date-period' ).val( '' );

                    setData(e.date._d);
                    initMonth = moment(e.date._d).add(-213, 'days').toDate().getMonth();
                    lastMonth = initMonth + 1;
                });
            } else {
                $( '#datepickers_pregnant' ).css({
                    position    : 'absolute',
                    opacity     : 0,
                    display: 'none'
                });
                $( '#datepickers_baby' ).css({
                    position    : 'relative',
                    opacity     : 1,
                    display: 'block'
                });

                date_baby_alt.on( 'dp.change', function ( e ) {
                    setData( e.date._d, true );
                    initMonth = moment(e.date._d).add(2,'days').toDate().getMonth();
                    lastMonth = initMonth + 1;
                });
            }
        });
    },

    setupCustomSelect   : function () {
        $('.custom-select').each(function(){
            var $this = $(this), numberOfOptions = $(this).children('option').length;

            $this.addClass('select-hidden');
            $this.wrap('<div class="select"></div>');
            $this.after('<div class="select-styled"></div>');

            var $styledSelect = $this.next('div.select-styled');
            $styledSelect.text($this.children('option').eq(0).text());

            var $list = $('<ul />', {
                'class': 'select-options'
            }).insertAfter($styledSelect);

            for (var i = 0; i < numberOfOptions; i++) {
                $('<li />', {
                    text  : $this.children( 'option' ).eq( i ).text(),
                    rel   : $this.children( 'option' ).eq( i ).val(),
                    class : $this.children( 'option' ).eq( i ).attr( 'disabled' ) === 'disabled' ? 'disabled' : '',
                }).appendTo($list);
            }

            var $listItems = $list.children('li');

            $styledSelect.click(function(e) {
                e.stopPropagation();
                $('div.select-styled.active').not(this).each(function(){
                    $(this).removeClass('active').next('ul.select-options').hide();
                });
                $(this).toggleClass('active').next('ul.select-options').toggle();
            });

            $listItems.click(function(e) {
                e.stopPropagation();

                if (this.className !== 'disabled') {
                    $styledSelect.text($(this).text()).removeClass('active');
                    $this.val($(this).attr('rel'));
                    $this.trigger('change');
                    $list.hide();
                }
            });

            $(document).click(function() {
                $styledSelect.removeClass('active');
                $list.hide();
            });

        });
    },

    setupRegister   : function () {
        var mediaEl = $( '#media' ),
            phoneEl = $( '#phone-number' ),
            formEl  = $( '#register-form' ),
            self = this;

        formEl.submit( function ( e ) {
            e.preventDefault();
            var media   = mediaEl.val();
            if ( media == 'facebook' ) {
                window.open( 'http://m.me/gobmxmisalud', '_blank' );
            } else if ( media == 'sms' ) {
                //var captchaResponse     = grecaptcha.getResponse();
                //if ( captchaResponse == '' ) {
                //    $('#messageModal .modal-body p').text( "No pudimos completar tu registro. Por favor revisa que todos los datos sean correctos." );
                //    $('#messageModal').modal('show');
                //} else if ( !phoneEl.val() || phoneEl.val() == '' ) {
                //    $('#messageModal .modal-body p').text("Ingrese su número telefónico.");
                //    $('#messageModal').modal('show');
                //} else if (!/^\d{10}$/.test(phoneEl.val()) ) {
                //    $('#messageModal .modal-body p').text("Ingrese un número telefónico correcto (de 10 dígitos).");
                //    $('#messageModal').modal('show');
                //} else {
                    $('#loader-container').css('display', 'block');
                    var contact_url = "https://rapidpro.datos.gob.mx/misalud/";
                    var contact_uuid;
                    var flow_to_run;
                    //Register new contact
                    $.ajax({
                        url         : contact_url,
                        type        : 'GET',
                        data        : {"name" : '',
                                       "urns": 'tel:+52'+phoneEl.val(),
                                       "token":"436d7fcbf36d026aba085a8adfa7f14796c06a38",
                                       "type_operation": "create_contact"
                                      },
                        dataType    : 'json',
                        error : function(res) {
                             $('#loader-container').css('display', 'none');
                              //Ask uuid contact
                              $('#confirmRegModal .modal-body p').text('').append('' +
                                '<span>Tu número ya está registrado en misalud.</span>' +
                                '<span>¿Deseas registrarte de nuevo?</span>' +
                                '<span>Esto borrará la información de tu último registro.</span>')
                              ;
                              $('#confirmRegModal').modal('show');
                              $('#confirmRegModal .btn-prima').on('click', function() {
                                  flow_to_run = "20308c47-002a-446c-a4f8-a21482f66bc8" ;
                                  beginFlow(flow_to_run,phoneEl.val());
                                  $('#confirmRegModal').modal('hide');
                              });
                        },
                        success     : function ( res ) {
                            phoneEl.val( '' );
                            $( '.btn-primary', formEl ).addClass( 'disabled' ).attr( 'disabled', true );

                            $( '#loader-container' ).css( 'display', 'none' );
                            flow_to_run= "dc950557-3519-4fd7-8385-52187cf84df9";
                            beginFlow(flow_to_run,phoneEl.val());
                            $( '#messageModal .modal-body p' ).text( "¡Registro exitoso! Pronto recibirás un mensaje de misalud a tu celular" );
                            $( '#messageModal' ).modal('show');
                        },
                    })
            }
         //}
            return false;
        });

        mediaEl.change( function () {
            if ( mediaEl.val() == 'sms' ) {
                $( '.form-submit' ).removeClass( 'submit-fixed' );
                phoneEl.fadeIn();
            } else {
                $( '.form-submit' ).addClass( 'submit-fixed' );
                phoneEl.fadeOut();
            }
        });
    },

    setupVideoModal : function () {
        $( '#videoModal' ).on( 'hide.bs.modal', function () {
            $( "#videoModal iframe" ).attr( "src", jQuery( "#videoModal iframe" ).attr( "src" ) );
        })
    },
};

$( document ).ready( GobMXMiSalud.init )

// Funtion to begin a rapidpro flow
function beginFlow (flow_to_run, contact_uuid) {
  $.ajax({
      url         : "https://rapidpro.datos.gob.mx/misalud/", 
      type        : 'GET',
      data        : {"flow" : flow_to_run,
                     "contacts": contact_uuid,
                     "type_operation": "star_conversation",
                     "token": "436d7fcbf36d026aba085a8adfa7f14796c06a38",
                     },
      dataType    : 'json',
   });
}

// Cierra el simulador al seleccionar el botón de cerrar
$('#simulator-phone .close.rounded').on('click', function() {
    if ($(window).width() < 768) {
        $('#simulator-phone').css('display', 'none');
    }
});

// No permite la propagación del disabled
$('.disabled').on('click', function(e) {
    e.preventDefault();
});

$( window ).on( 'scroll', function() {
    var element = $('.register-button');
    var footerOT = $('footer').offset().top;
    var windowHeight = $(window).height();
    var scrollTop = $( window ).scrollTop();
    var untilHere = $('html, body').height() - $('footer').height() - 180;

    if (scrollTop > (footerOT - windowHeight)) {
        element.addClass('register-static')
        element.css('top', untilHere);
    } else {
        element.removeClass('register-static');
        element.css('top', 'inherit');
    }
});
