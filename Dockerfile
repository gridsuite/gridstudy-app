FROM httpd:2.4

COPY app-httpd.conf /usr/local/apache2/conf/
COPY build /usr/local/apache2/htdocs/
