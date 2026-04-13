FROM timescale/timescaledb:latest-pg17

USER root

# Build tools needed to compile pg_textsearch from source
RUN apk add --no-cache \
    build-base \
    git \
    clang \
    llvm \
    postgresql17-dev

# The timescaledb image was compiled with LLVM 19 (pg_config returns clang-19 and
# /usr/lib/llvm19/bin/llvm-lto). Alpine 3.23 ships LLVM 20/21.
# Symlink the installed tools into the paths pg_config/PGXS expect.
RUN ln -sf /usr/bin/clang /usr/bin/clang-19 && \
    mkdir -p /usr/lib/llvm19/bin && \
    LLVM_LTO=$(find /usr/bin /usr/lib -name "llvm-lto" -o -name "llvm-lto21" -o -name "llvm-lto20" \
               2>/dev/null | head -1) && \
    if [ -n "$LLVM_LTO" ]; then \
        ln -sf "$LLVM_LTO" /usr/lib/llvm19/bin/llvm-lto; \
    fi

# Build and install pg_textsearch v1.0.0
RUN git clone --depth 1 --branch v1.0.0 \
        https://github.com/timescale/pg_textsearch.git /tmp/pg_textsearch && \
    cd /tmp/pg_textsearch && \
    PG_CONFIG=/usr/local/bin/pg_config make && \
    PG_CONFIG=/usr/local/bin/pg_config make install && \
    rm -rf /tmp/pg_textsearch

# Remove build tools to keep image lean
RUN apk del build-base git clang llvm postgresql17-dev

USER postgres
