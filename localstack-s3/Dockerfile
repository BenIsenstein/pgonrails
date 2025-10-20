FROM localstack/localstack:s3-latest

RUN apt-get update && apt-get install -y awscli

COPY ./init.sh /etc/localstack/init/ready.d/init.sh