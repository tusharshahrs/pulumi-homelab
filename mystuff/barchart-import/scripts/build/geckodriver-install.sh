apt-get update
apt-get install -y --no-install-recommends apt
apt-get install -y wget \
        build-essential \
        libgl1-mesa-glx \
        libgtk-3-dev \
        libdbus-glib-1-2 \
        libxt6
wget --no-verbose -O /tmp/firefox.tar.bz2 https://download-installer.cdn.mozilla.net/pub/firefox/releases/$FIREFOX_VERSION/linux-x86_64/en-US/firefox-$FIREFOX_VERSION.tar.bz2 \
   && rm -rf /opt/firefox \
   && tar -C /opt -xjf /tmp/firefox.tar.bz2 \
   && rm /tmp/firefox.tar.bz2 \
   && mv /opt/firefox /opt/firefox-$FIREFOX_VERSION \
   && ln -fs /opt/firefox-$FIREFOX_VERSION/firefox /usr/bin/firefox
wget --no-verbose -O /tmp/geckodriver.tar.gz http://github.com/mozilla/geckodriver/releases/download/$GK_VERSION/geckodriver-$GK_VERSION-linux64.tar.gz \
   && rm -rf /opt/geckodriver \
   && tar -C /opt -zxf /tmp/geckodriver.tar.gz \
   && rm /tmp/geckodriver.tar.gz \
   && mv /opt/geckodriver /opt/geckodriver-$GK_VERSION \
   && chmod 755 /opt/geckodriver-$GK_VERSION \
   && ln -fs /opt/geckodriver-$GK_VERSION /usr/bin/geckodriver