import Logger "lipa_backend/logger"; // Correct path to logger module
import Map "mo:base/OrderedMap";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";

module {
    public type AdminOnlySystemState = {
        var adminPrincipal : ?Principal;
    };
    
    public func initState() : AdminOnlySystemState {
        {
            var adminPrincipal = null;
        }
    };
    
    // Initialize auth with the first caller becoming admin
    public func initializeAuth(state: AdminOnlySystemState, caller: Principal) {
        Logger.logInfo("Initializing authentication for caller: " # Principal.toText(caller));
        if (Principal.isAnonymous(caller)) {
            Debug.trap("Anonymous principals cannot be admin");
        };

        switch (state.adminPrincipal) {
            case (?_) { };
            case null {
                state.adminPrincipal := ?caller;
                Logger.logInfo("Assigned admin role to caller: " # Principal.toText(caller));
            };
        };
    };

    private func hasAdminPermission(state: AdminOnlySystemState, caller : Principal) : Bool {
        switch (state.adminPrincipal) {
            case (?admin) { caller == admin };
            case null { false };
        };
    };

    public func isCurrentUserAdmin(state: AdminOnlySystemState, caller: Principal) : Bool {
        hasAdminPermission(state, caller);
    };
};
