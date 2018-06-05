import * as React from "react";

import { addLocaleData, FormattedMessage, IntlProvider } from "react-intl";

import * as zh from "react-intl/locale-data/zh";

import * as en from "react-intl/locale-data/en";

import en_US from "./locale/en_US";
import zh_CN from "./locale/zh_CN";

interface IntlDemoState {
  langFlag: string;
  messages: any;
}

class IntlDemo extends React.Component<{}, IntlDemoState> {
  constructor(props: {}) {
    super(props);

    const messages = {} as any;
    messages.en = en_US;
    messages["zh-CN"] = zh_CN;

    addLocaleData([...zh, ...en]);

    this.state = {
      langFlag: "zh-CN",
      messages
    };
  }
  public render() {
    const { langFlag, messages } = this.state;

    return (
      <div>
        <IntlProvider locale={langFlag} messages={messages[langFlag]}>
          <div>
            <FormattedMessage
              id="hello"
              defaultMessage="Default message: Translations Example"
            />

            <FormattedMessage
              id="module1.Page2.Text3"
              defaultMessage="too long....."
            />
          </div>
        </IntlProvider>
      </div>
    );
  }
}

export default IntlDemo;
