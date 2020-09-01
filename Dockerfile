FROM httpd:2.4

RUN echo "Include conf/app-httpd.conf" >> /usr/local/apache2/conf/httpd.conf
COPY app-httpd.conf /usr/local/apache2/conf/
COPY build /usr/local/apache2/htdocs/gridstudy
RUN sed -i -e 's;<base href="\./"/>;<base href="<!--#echo var="BASE" -->"/>;' /usr/local/apache2/htdocs/gridstudy/index.html
