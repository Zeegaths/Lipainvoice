import Debug "mo:base/Debug";

module {
    public func logInfo(message: Text) {
        Debug.print("INFO: " # message);
    };

    public func logError(message: Text) {
        Debug.print("ERROR: " # message);
    };
};
