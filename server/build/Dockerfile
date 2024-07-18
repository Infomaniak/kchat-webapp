FROM ubuntu:jammy-20230308


# Setting bash as our shell, and enabling pipefail option
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Some ENV variables
ENV PATH="/mattermost/bin:${PATH}"
ARG ARCH=arm64
ARG PUID=2000
ARG PGID=2000
ARG MM_PACKAGE="https://releases.mattermost.com/9.7.2/mattermost-9.7.2-linux-${ARCH}.tar.gz?src=docker"

# # Install needed packages and indirect dependencies
RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y \
  ca-certificates \
  curl \
  mime-support \
  unrtf \
  wv \
  poppler-utils \
  tidy \
  tzdata \
  && rm -rf /var/lib/apt/lists/*

# Set mattermost group/user and download Mattermost
RUN mkdir -p /mattermost/data /mattermost/plugins /mattermost/client/plugins \
  && addgroup -gid ${PGID} mattermost \
  && adduser -q --disabled-password --uid ${PUID} --gid ${PGID} --gecos "" --home /mattermost mattermost \
  && if [ -n "$MM_PACKAGE" ]; then curl $MM_PACKAGE | tar -xvz ; \
  else echo "please set the MM_PACKAGE" ; exit 127 ; fi \
  && chown -R mattermost:mattermost /mattermost /mattermost/data /mattermost/plugins /mattermost/client/plugins

# We should refrain from running as privileged user
USER mattermost

#Healthcheck to make sure container is ready
HEALTHCHECK --interval=30s --timeout=10s \
  CMD curl -f http://localhost:8065/api/v4/system/ping || exit 1

# Configure entrypoint and command
COPY --chown=mattermost:mattermost --chmod=765 entrypoint.sh /
ENTRYPOINT ["/entrypoint.sh"]
WORKDIR /mattermost
CMD ["mattermost"]

EXPOSE 8065 8067 8074 8075

# Declare volumes for mount point directories
VOLUME ["/mattermost/data", "/mattermost/logs", "/mattermost/config", "/mattermost/plugins", "/mattermost/client/plugins"]
