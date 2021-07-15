const dbus = require("dbus-native");

const sessionBus = dbus.sessionBus();
if (!sessionBus) throw new Error('Could not connect to session bus');
sessionBus.requestName("net.belka.joplin", 0x04, (err, code) => {
  if (err) throw new Error(err);

  if (code === 3) throw new Error(`Another instance is already running`);
  if (code !== 1) {
    throw new Error(
      `Received code ${code} while requesting service name "net.belka.joplin"`
    );
    process.exit(1)
    }
});

module.exports.createKRunnerInterface = ({
  path,
  actionsFunction,
  runFunction,
  matchFunction
}) => {
  const interface = {};
  const interfaceDesc = {
    name: "org.kde.krunner1",
    methods: {}
  };

  if (actionsFunction) {
    interface.Actions = actionsFunction;
    interfaceDesc.methods.Actions = ["", "a(sss)", [], ["matches"]];
  }

  if (runFunction) {
    interface.Run = runFunction;
    interfaceDesc.methods.Run = ["ss", "", ["matchId", "actionId"], []];
  }

  if (matchFunction) {
    interface.Match = matchFunction;
    interfaceDesc.methods.Match = [
      "s",
      "a(sssida{sv})",
      ["query"],
      ["matches"]
    ];
  }

  sessionBus.exportInterface(interface, path, interfaceDesc);
};
