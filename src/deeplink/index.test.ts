import { parseQRFormat, QRFormat, parseQRCode } from "./index"; // adjust import path as needed

const testCases = [
  {
    input:
      "https://app.citizenwallet.xyz/#/?alias=app&receiveParams=H4sIAO8gHGUA_7NPTEkpSi0utjWocHG0TDU2dDM0N3MzdTKxtEwydjIysEg0MnBLNTQD8hIdDQydHI3M1BJzMhOLbRMLCgC_bpezPQAAAA==",
    expectedFormat: QRFormat.receiveUrl,
    expectedData: [
      "0xDA9e31F176F5B499b3B208a20Fe169b3aA01BA26",
      null,
      null,
      "app",
    ],
  },
  {
    input:
      "https://app.citizenwallet.xyz/#/?alias=app&receiveParams=H4sIABYhHGUA_w3MQQqAIBAAwN94jF0ty8MSSviPDZcIsiQLen4e5zIzp3RLrQTf4p0YjDjaOITeudUEDRNriIK2iT1g8NoqPnauxKUoztd7PoQdgMpt4U3oBzYQnutSAAAA",
    expectedFormat: QRFormat.receiveUrl,
    expectedData: [
      "0xDA9e31F176F5B499b3B208a20Fe169b3aA01BA26",
      "1.00",
      null,
      "app",
    ],
  },
  {
    input:
      "https://app.citizenwallet.xyz/#/?alias=app&voucher=H4sIAOQjHGUA_0WQ22rDMAyG38XXCchWfFDeRgebhbZbSELZKH33Od3Gbmws9Evf54fT7Ws9Ptz8cLqsb3Vzs-O6jz6UUY_NDb_llTe-7Wfbcu8tVSMZMlVFDUlIARkM25RbK5jEPf-CR_08zkCOmVAkiYlB8DEwc21Zp8mslsZqFENoqWUpMWG1bFJIBapaMOsgF2t90P4C_nn-Q9nlWt_djGFw_epn9yiDW93sB7fz9UQwyJQYGvqUoAIF7TuzTcghhA5eofhsuWN0Ou99Y08QRTlDgO55Ot1Y-yRfkRJFJaEkGHPARqIwCVUuBXNNhRqUbERaEmhSsDilXmnIWV6_s9iJJD1rAqMnpnHyDUeKPI1oUdkLYG6n-b1u-_Jx-j2_ASd26ZKxAQAA&params=H4sIAOQjHGUA_wXBMQqAIBQA0Ks4OYaaficHUbtA1P41o6BSrKDj9x4eO94Ga6WpZXxKM-zTKqKSbrV8gABR-pyClgmYYAss0VtQQupe0AvPbObypi03spZGWMfJNHr3A51CYNJWAAAA&alias=app",
    expectedFormat: QRFormat.voucher,
    expectedData: ["", null, null, null],
  },
  {
    input: "0xDA9e31F176F5B499b3B208a20Fe169b3aA01BA26",
    expectedFormat: QRFormat.address,
    expectedData: [
      "0xDA9e31F176F5B499b3B208a20Fe169b3aA01BA26",
      null,
      null,
      null,
    ],
  },
  {
    input: "ethereum:0xDA9e31F176F5B499b3B208a20Fe169b3aA01BA26",
    expectedFormat: QRFormat.eip681,
    expectedData: [
      "0xDA9e31F176F5B499b3B208a20Fe169b3aA01BA26",
      null,
      null,
      null,
    ],
  },
  {
    input:
      "ethereum:0xDA9e31F176F5B499b3B208a20Fe169b3aA01BA26?value=0.1&gas=0.1&gasPrice=0.1&data=0x0",
    expectedFormat: QRFormat.eip681,
    expectedData: [
      "0xDA9e31F176F5B499b3B208a20Fe169b3aA01BA26",
      "0.1",
      null,
      null,
    ],
  },
  {
    input:
      "ethereum:0x89205a3a3b2a69de6dbf7f01ed13b2108b2c43e7/transfer?address=0xDA9e31F176F5B499b3B208a20Fe169b3aA01BA26&uint256=1",
    expectedFormat: QRFormat.eip681Transfer,
    expectedData: [
      "0xDA9e31F176F5B499b3B208a20Fe169b3aA01BA26",
      "1",
      null,
      null,
    ],
  },
  {
    input: "",
    expectedFormat: QRFormat.unsupported,
    expectedData: ["", null, null, null],
  },
  {
    input: "DA9e31F176F5B499b3B208a20Fe169b3aA01BA26",
    expectedFormat: QRFormat.unsupported,
    expectedData: ["", null, null, null],
  },
  {
    input:
      "ethereum:0x845598Da418890a674cbaBA26b70807aF0c61dFE@8453/transfer?address=0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE",
    expectedFormat: QRFormat.eip681Transfer,
    expectedData: [
      "0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE",
      null,
      null,
      null,
    ],
  },
  {
    input: "ethereum:0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE@8453",
    expectedFormat: QRFormat.eip681,
    expectedData: [
      "0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE",
      null,
      null,
      null,
    ],
  },
  {
    input:
      "https://example.com/?sendto=0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE@wallet.pay.brussels&amount=10.50&description=test",
    expectedFormat: QRFormat.sendtoUrl,
    expectedData: [
      "0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE",
      "10.50",
      "test",
      "wallet.pay.brussels",
    ],
  },
  {
    input:
      "http://example.com/?sendto=0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE@wallet.pay.brussels&amount=10.50",
    expectedFormat: QRFormat.sendtoUrl,
    expectedData: [
      "0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE",
      "10.50",
      null,
      "wallet.pay.brussels",
    ],
  },
  {
    input:
      "https://example.com/?sendto=xavier@wallet.pay.brussels&amount=10.50",
    expectedFormat: QRFormat.sendtoUrl,
    expectedData: ["xavier", "10.50", null, "wallet.pay.brussels"],
  },
  {
    input:
      "https://live.citizenwallet.xyz/wallet.pay.brussels/fridge/pay?sendto=fridge@wallet.commonshub.brussels&description=Drinks&amount=3.00",
    expectedFormat: QRFormat.sendtoUrl,
    expectedData: ["fridge", "3.00", "Drinks", "wallet.commonshub.brussels"],
  },
  {
    input:
      "https://example.com/?sendto=0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE%40wallet.pay.brussels%26amount%3D10.50%26description%3Dtest",
    expectedFormat: QRFormat.sendtoUrl,
    expectedData: [
      "0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE",
      "10.50",
      "test",
      "wallet.pay.brussels",
    ],
  },
  {
    input:
      "https://example.com/?sendto=0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE@wallet.pay.brussels%26amount%3D10.50%26description%3Dtest",
    expectedFormat: QRFormat.sendtoUrl,
    expectedData: [
      "0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE",
      "10.50",
      "test",
      "wallet.pay.brussels",
    ],
  },
  {
    input:
      "https://app.citizenwallet.xyz/#/?sendto=0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE@wallet.pay.brussels&amount=10.50&description=test",
    expectedFormat: QRFormat.sendtoUrl,
    expectedData: [
      "0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE",
      "10.50",
      "test",
      "wallet.pay.brussels",
    ],
  },
  {
    input:
      "https://app.citizenwallet.xyz/#/?sendto=0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE@wallet.pay.brussels%26amount%3D10.50%26description%3Dtest",
    expectedFormat: QRFormat.sendtoUrl,
    expectedData: [
      "0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE",
      "10.50",
      "test",
      "wallet.pay.brussels",
    ],
  },
  {
    input:
      "https://example.com/?sendto=0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE@wallet.pay.brussels&amount=10.50&description=test&tipTo=0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE&tipAmount=2.00&tipDescription=tipDescriptionTest",
    expectedFormat: QRFormat.sendtoUrl,
    expectedData: [
      "0x6C8bdE31530Ca3382150Fb18e17D8f920CcF86BE",
      "10.50",
      "test",
      "wallet.pay.brussels",
    ],
  },
];

describe("parseQRFormat", () => {
  test.each(testCases)(
    'should parse "$input" as $expected',
    ({ input, expectedFormat }) => {
      expect(parseQRFormat(input)).toBe(expectedFormat);
    }
  );
});

describe("parseQRCode", () => {
  test.each(testCases)(
    'should parse "$input" as "$expectedData"',
    ({ input, expectedData }) => {
      const result = parseQRCode(input);
      expect(result).toEqual(expectedData);
    }
  );
});
