#ifndef NETWORK_TLS_H
#define NETWORK_TLS_H

#include <curl/curl.h>

CURL *network_curl_easy_init(void);

#define curl_easy_init network_curl_easy_init

#endif
