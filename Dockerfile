# we also use dev just because the normal image doesn't have sed but dev does so we will copy it over
FROM gridsuite/iodhi-httpd:2.4.68-debian13-dev@sha256:0e2f2508ac2cf10f8bfbcd5871f5d39e3d1f14536fe2d588603dea026aa4fd95 as dev
FROM gridsuite/iodhi-httpd:2.4.68-debian13@sha256:f8a042e7f71c9f2fc2b30519a9970b2b74b9e4b43a770d3f9144943a1e5c2cbd

# allow to inject just our conf, not replace the whole httpd.conf
RUN echo 'Include "/usr/local/apache2/conf/app-httpd.conf"' >> /usr/local/apache2/conf/httpd.conf

# chown to www-data to allow the subsequent sed to work.
# Note that the rest of the files from the image are already www-data:www-data
COPY --chown=www-data:www-data app-httpd.conf /usr/local/apache2/conf/app-httpd.conf
COPY --chown=www-data:www-data build /usr/local/apache2/htdocs/gridstudy

# When copying sed hopefully we don't need any extra shared libraries
# NOTE: we use it at runtime, and also in this Dockerfile during image
# build so we should see easily that it works.
COPY --from=dev /bin/sed /bin/sed

# setup ssi for base in index.html using the per request variable defined in app-httpd.conf
RUN sed -i -e 's;<base href="/" />;<base href="<!--#echo var="BASE" -->" />;' /usr/local/apache2/htdocs/gridstudy/index.html
