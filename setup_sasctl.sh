#!/bin/bash

# 사용하고자 하는 SAS 버전을 설정한다.
SASCTL_VERSION=${1:-0.4.0}

# SAS MASTER IP 설정. 환경변수로부터 값을 가져오거나 기본값 사용.
SASCTL_ENDPOINT=${SASCTL_ENDPOINT:-8.10.0.40:32219}

# 사용자 bin 디렉토리 생성
mkdir -p ~/bin

# ~/bin을 PATH 환경 변수에 추가 및 변경사항 적용
if [[ "$SHELL" == *zsh* ]]; then
    # zsh configuration
    echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc
    source ~/.zshrc
else
    # bash or other shells
    echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
    source ~/.bashrc
fi

# sasctl.jar 다운로드
# 해당 작업이 진행되기 위해서는 SAS 통합환경에 접속하기 위해 켜둔 VPN을 꺼야 함
curl http://192.168.9.12/binary/super-app-runtime/super-app-runtime-$SASCTL_VERSION/sasctl-$SASCTL_VERSION.jar -o ~/bin/sasctl.jar

# sasctl 스크립트 작성
cat <<EOF > ~/bin/sasctl
#!/bin/bash

java -jar ~/bin/sasctl.jar "$SASCTL_ENDPOINT" "\$@"
EOF

# 실행 권한 부여
chmod +x ~/bin/sasctl

