# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.234.0/containers/ubuntu/.devcontainer/base.Dockerfile

# [Choice] Ubuntu version (use ubuntu-22.04 or ubuntu-18.04 on local arm64/Apple Silicon): ubuntu-22.04, ubuntu-20.04, ubuntu-18.04
ARG VARIANT="jammy"
FROM mcr.microsoft.com/vscode/devcontainers/base:0-${VARIANT}

# [Optional] Uncomment this section to install additional OS packages.
# RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
#     && apt-get -y install --no-install-recommends <your-package-list-here>

RUN apt update && apt install -y pkg-config build-essential libudev-dev libssl-dev
USER vscode
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="/home/vscode/.cargo/bin:${PATH}"
RUN cargo install --git https://github.com/project-serum/anchor avm --locked --force
RUN sh -c "$(curl -sSfL https://release.solana.com/v1.10.19/install)"
RUN avm install latest && avm use latest
