FROM stagex/core-busybox@sha256:01b31cc07543733fbf6889e596427af943aba2780bc2f514a3d30bb290da7e2a AS core-busybox

FROM core-busybox AS shell
ENTRYPOINT []
WORKDIR /workdir
COPY public /workdir/public
EXPOSE 8083
CMD ["/bin/busybox", "httpd", "-f", "-p", "0.0.0.0:8083", "-h", "/workdir/public"]
