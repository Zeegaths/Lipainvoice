import OrderedMap "mo:base/OrderedMap";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Logger "lipa_backend/logger"; 

module {
    public type UserRole = {
        #admin;
        #user;
        #guest;
    };

    public type ApprovalStatus = {
        #approved;
        #rejected;
        #pending;
    };

    public type MultiUserSystemState = {
        var adminAssigned : Bool;
        var userRoles : OrderedMap.Map<Principal, UserRole>;
        var approvalStatus : OrderedMap.Map<Principal, ApprovalStatus>;
    };

    public func initState() : MultiUserSystemState {
        let principalMap = OrderedMap.Make<Principal>(Principal.compare);
        {
            var adminAssigned = false;
            var userRoles = principalMap.empty<UserRole>();
            var approvalStatus = principalMap.empty<ApprovalStatus>();
        };
    };

    // First principal that calls this function becomes admin, all other principals become pending users.
    public func initializeAuth(state : MultiUserSystemState, caller : Principal) {
        Logger.logInfo("Initializing authentication for caller: " # Principal.toText(caller));
        if (not Principal.isAnonymous(caller)) {
            let principalMap = OrderedMap.Make<Principal>(Principal.compare);
            switch (principalMap.get(state.userRoles, caller)) {
                case (?_) {};
                case (null) {
                    if (not state.adminAssigned) {
                        state.userRoles := principalMap.put(state.userRoles, caller, #admin);
                        state.approvalStatus := principalMap.put(state.approvalStatus, caller, #approved);
                        state.adminAssigned := true;
                        Logger.logInfo("Assigned admin role to caller: " # Principal.toText(caller));
                    } else {
                        state.userRoles := principalMap.put(state.userRoles, caller, #user);
                        state.approvalStatus := principalMap.put(state.approvalStatus, caller, #pending);
                        Logger.logInfo("Assigned user role to caller: " # Principal.toText(caller));
                    };
                };
            };
        } else {
            Logger.logError("Anonymous caller attempted to initialize authentication.");
        };
    };
};
