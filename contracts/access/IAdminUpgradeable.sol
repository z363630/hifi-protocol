// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.8.0;

/// @title IAdminUpgradeable
/// @author Hifi
interface IAdminUpgradeable {
    /// EVENTS ///

    /// @notice Emitted when the admin is transferred.
    /// @param oldAdmin The address of the old admin.
    /// @param newAdmin The address of the new admin.
    event TransferAdmin(address indexed oldAdmin, address indexed newAdmin);

    /// NON-CONSTANT FUNCTIONS ///

    /// @notice Leaves the contract without admin, so it will not be possible to call `onlyAdmin`
    /// functions anymore.
    ///
    /// WARNING: Doing this will leave the contract without an admin, thereby removing any
    /// functionality that is only available to the admin.
    ///
    /// Requirements:
    ///
    /// - The caller must be the administrator.
    function _renounceAdmin() external;

    /// @notice Transfers the admin of the contract to a new account (`newAdmin`). Can only be
    /// called by the current admin.
    /// @param newAdmin The acount of the new admin.
    function _transferAdmin(address newAdmin) external;

    /// CONSTANT FUNCTIONS ///

    /// @notice The address of the administrator account or contract.
    /// @return The address of the administrator.
    function admin() external view returns (address);
}
