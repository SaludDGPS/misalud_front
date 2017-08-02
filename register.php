<?php

function sendRegisterRequest () {
    $data           = new stdClass();
    $data->name     = $_GET['name'];
    $data->urns     = [ "tel:+52" . $_GET['phone'] ];
    $data_string    = json_encode( $data );

    // create curl resource 
    $ch = curl_init();
    // set url
    curl_setopt( $ch, CURLOPT_URL, "https://rapidpro.datos.gob.mx/api/v2/contacts.json" ); 

    curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
    curl_setopt( $ch, CURLOPT_POSTFIELDS, $data_string );
    curl_setopt( $ch, CURLOPT_HTTPHEADER, array(
        'Authorization: token 436d7fcbf36d026aba085a8adfa7f14796c06a38',
        'Content-Type: application/json',
        'Content-Length: ' . strlen( $data_string ) )
    );

    $output     = curl_exec( $ch );

    // close curl resource to free up system resources 
    curl_close( $ch );

    return json_decode( $output );
}

function getContact () {
    // create curl resource 
    $ch = curl_init();
    // set url
    curl_setopt( $ch, CURLOPT_URL, "https://rapidpro.datos.gob.mx/api/v2/contacts.json?urn=tel%3A%2B52" . $_GET['phone'] ); 

    curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
    curl_setopt( $ch, CURLOPT_HTTPHEADER, array(
        'Authorization: token 436d7fcbf36d026aba085a8adfa7f14796c06a38'
    ));

    $output     = curl_exec( $ch );

    // close curl resource to free up system resources 
    curl_close( $ch );

    return json_decode( $output );
}

function initiateConversation ( $uuid ) {
    $data           = new stdClass();
    $data->flow     = 'dc950557-3519-4fd7-8385-52187cf84df9';
    $data->contacts = [ $uuid ];
    $data_string    = json_encode( $data );

    // create curl resource 
    $ch = curl_init();
    // set url
    curl_setopt( $ch, CURLOPT_URL, "https://rapidpro.datos.gob.mx/api/v2/flow_starts.json" ); 
    //return the transfer as a string
    curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
    curl_setopt( $ch, CURLOPT_POSTFIELDS, $data_string );
    curl_setopt( $ch, CURLOPT_HTTPHEADER, array(
        'Authorization: token 436d7fcbf36d026aba085a8adfa7f14796c06a38',
        'Content-Type: application/json',
        'Content-Length: ' . strlen( $data_string ) )
    );

    $output = curl_exec( $ch );

    // close curl resource to free up system resources 
    curl_close( $ch );

    return json_decode( $output );
}

$register_result    = sendRegisterRequest();
// The register attempt was successful
if ( $register_result->uuid && $register_result->uuid != '' ) {
    echo json_encode( initiateConversation( $register_result->uuid ) );
} else { // Return the error to the client
    $contact    = getContact();

    echo json_encode( initiateConversation( $contact->results[0]->uuid ) );
}
