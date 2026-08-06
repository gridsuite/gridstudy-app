FROM gridsuite/httpd:1.0.0@sha256:e054963bc0bdb0df484ad59a40072f29b3ff921a9887aa041f005c87e5ba2890

# chown to www-data to allow the subsequent sed to work.
# Note that the rest of the files from the image are already www-data:www-data
COPY --chown=www-data:www-data app-httpd.conf /usr/local/apache2/conf/app-httpd.conf
COPY --chown=www-data:www-data build /usr/local/apache2/htdocs/gridstudy

# setup ssi for base in index.html using the per request variable defined in app-httpd.conf
RUN sed -i -e 's;<base href="/" />;<base href="<!--#echo var="BASE" -->" />;' /usr/local/apache2/htdocs/gridstudy/index.html
