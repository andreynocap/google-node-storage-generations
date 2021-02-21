"use strict";
// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Iam = void 0;
const promisify_1 = require("@google-cloud/promisify");
const arrify = require("arrify");
const util_1 = require("./util");
/**
 * Get and set IAM policies for your Cloud Storage bucket.
 *
 * @see [Cloud Storage IAM Management](https://cloud.google.com/storage/docs/access-control/iam#short_title_iam_management)
 * @see [Granting, Changing, and Revoking Access](https://cloud.google.com/iam/docs/granting-changing-revoking-access)
 * @see [IAM Roles](https://cloud.google.com/iam/docs/understanding-roles)
 *
 * @constructor Iam
 * @mixin
 *
 * @param {Bucket} bucket The parent instance.
 * @example
 * const {Storage} = require('@google-cloud/storage');
 * const storage = new Storage();
 * const bucket = storage.bucket('my-bucket');
 * // bucket.iam
 */
class Iam {
    constructor(bucket) {
        this.request_ = bucket.request.bind(bucket);
        this.resourceId_ = 'buckets/' + bucket.getId();
    }
    /**
     * @typedef {object} GetPolicyOptions Requested options for IAM#getPolicy().
     * @property {number} [requestedPolicyVersion] The version of IAM policies to
     *     request. If a policy with a condition is requested without setting
     *     this, the server will return an error. This must be set to a value
     *     of 3 to retrieve IAM policies containing conditions. This is to
     *     prevent client code that isn't aware of IAM conditions from
     *     interpreting and modifying policies incorrectly. The service might
     *     return a policy with version lower than the one that was requested,
     *     based on the feature syntax in the policy fetched.
     *     @see [IAM Policy versions]{@link https://cloud.google.com/iam/docs/policies#versions}
     * @property {string} [userProject] The ID of the project which will be
     *     billed for the request.
     */
    /**
     * @typedef {array} GetPolicyResponse
     * @property {Policy} 0 The policy.
     * @property {object} 1 The full API response.
     */
    /**
     * @typedef {object} Policy
     * @property {PolicyBinding[]} policy.bindings Bindings associate members with roles.
     * @property {string} [policy.etag] Etags are used to perform a read-modify-write.
     * @property {number} [policy.version] The syntax schema version of the Policy.
     *      To set an IAM policy with conditional binding, this field must be set to
     *      3 or greater.
     *     @see [IAM Policy versions]{@link https://cloud.google.com/iam/docs/policies#versions}
     */
    /**
     * @typedef {object} PolicyBinding
     * @property {string} role Role that is assigned to members.
     * @property {string[]} members Specifies the identities requesting access for the bucket.
     * @property {Expr} [condition] The condition that is associated with this binding.
     */
    /**
     * @typedef {object} Expr
     * @property {string} [title] An optional title for the expression, i.e. a
     *     short string describing its purpose. This can be used e.g. in UIs
     *     which allow to enter the expression.
     * @property {string} [description] An optional description of the
     *     expression. This is a longer text which describes the expression,
     *     e.g. when hovered over it in a UI.
     * @property {string} expression Textual representation of an expression in
     *     Common Expression Language syntax. The application context of the
     *     containing message determines which well-known feature set of CEL
     *     is supported.The condition that is associated with this binding.
     *
     * @see [Condition] https://cloud.google.com/storage/docs/access-control/iam#conditions
     */
    /**
     * Get the IAM policy.
     *
     * @param {GetPolicyOptions} [options] Request options.
     * @param {GetPolicyCallback} [callback] Callback function.
     * @returns {Promise<GetPolicyResponse>}
     *
     * @see [Buckets: setIamPolicy API Documentation]{@link https://cloud.google.com/storage/docs/json_api/v1/buckets/getIamPolicy}
     *
     * @example
     * const {Storage} = require('@google-cloud/storage');
     * const storage = new Storage();
     * const bucket = storage.bucket('my-bucket');
     *
     * bucket.iam.getPolicy(
     *     {requestedPolicyVersion: 3},
     *     function(err, policy, apiResponse) {
     *
     *     },
     * );
     *
     * //-
     * // If the callback is omitted, we'll return a Promise.
     * //-
     * bucket.iam.getPolicy({requestedPolicyVersion: 3})
     *   .then(function(data) {
     *     const policy = data[0];
     *     const apiResponse = data[1];
     *   });
     *
     * @example <caption>include:samples/iam.js</caption>
     * region_tag:storage_view_bucket_iam_members
     * Example of retrieving a bucket's IAM policy:
     */
    getPolicy(optionsOrCallback, callback) {
        const { options, callback: cb } = util_1.normalize(optionsOrCallback, callback);
        const qs = {};
        if (options.userProject) {
            qs.userProject = options.userProject;
        }
        if (options.requestedPolicyVersion !== null &&
            options.requestedPolicyVersion !== undefined) {
            qs.optionsRequestedPolicyVersion = options.requestedPolicyVersion;
        }
        this.request_({
            uri: '/iam',
            qs,
        }, cb);
    }
    /**
     * Set the IAM policy.
     *
     * @throws {Error} If no policy is provided.
     *
     * @param {Policy} policy The policy.
     * @param {SetPolicyOptions} [options] Configuration opbject.
     * @param {SetPolicyCallback} callback Callback function.
     * @returns {Promise<SetPolicyResponse>}
     *
     * @see [Buckets: setIamPolicy API Documentation]{@link https://cloud.google.com/storage/docs/json_api/v1/buckets/setIamPolicy}
     * @see [IAM Roles](https://cloud.google.com/iam/docs/understanding-roles)
     *
     * @example
     * const {Storage} = require('@google-cloud/storage');
     * const storage = new Storage();
     * const bucket = storage.bucket('my-bucket');
     *
     * const myPolicy = {
     *   bindings: [
     *     {
     *       role: 'roles/storage.admin',
     *       members:
     * ['serviceAccount:myotherproject@appspot.gserviceaccount.com']
     *     }
     *   ]
     * };
     *
     * bucket.iam.setPolicy(myPolicy, function(err, policy, apiResponse) {});
     *
     * //-
     * // If the callback is omitted, we'll return a Promise.
     * //-
     * bucket.iam.setPolicy(myPolicy).then(function(data) {
     *   const policy = data[0];
     *   const apiResponse = data[1];
     * });
     *
     * @example <caption>include:samples/iam.js</caption>
     * region_tag:storage_add_bucket_iam_member
     * Example of adding to a bucket's IAM policy:
     *
     * @example <caption>include:samples/iam.js</caption>
     * region_tag:storage_remove_bucket_iam_member
     * Example of removing from a bucket's IAM policy:
     */
    setPolicy(policy, optionsOrCallback, callback) {
        if (policy === null || typeof policy !== 'object') {
            throw new Error('A policy object is required.');
        }
        const { options, callback: cb } = util_1.normalize(optionsOrCallback, callback);
        this.request_({
            method: 'PUT',
            uri: '/iam',
            json: Object.assign({
                resourceId: this.resourceId_,
            }, policy),
            qs: options,
        }, cb);
    }
    /**
     * Test a set of permissions for a resource.
     *
     * @throws {Error} If permissions are not provided.
     *
     * @param {string|string[]} permissions The permission(s) to test for.
     * @param {TestIamPermissionsOptions} [options] Configuration object.
     * @param {TestIamPermissionsCallback} [callback] Callback function.
     * @returns {Promise<TestIamPermissionsResponse>}
     *
     * @see [Buckets: testIamPermissions API Documentation]{@link https://cloud.google.com/storage/docs/json_api/v1/buckets/testIamPermissions}
     *
     * @example
     * const {Storage} = require('@google-cloud/storage');
     * const storage = new Storage();
     * const bucket = storage.bucket('my-bucket');
     *
     * //-
     * // Test a single permission.
     * //-
     * const test = 'storage.buckets.delete';
     *
     * bucket.iam.testPermissions(test, function(err, permissions, apiResponse) {
     *   console.log(permissions);
     *   // {
     *   //   "storage.buckets.delete": true
     *   // }
     * });
     *
     * //-
     * // Test several permissions at once.
     * //-
     * const tests = [
     *   'storage.buckets.delete',
     *   'storage.buckets.get'
     * ];
     *
     * bucket.iam.testPermissions(tests, function(err, permissions) {
     *   console.log(permissions);
     *   // {
     *   //   "storage.buckets.delete": false,
     *   //   "storage.buckets.get": true
     *   // }
     * });
     *
     * //-
     * // If the callback is omitted, we'll return a Promise.
     * //-
     * bucket.iam.testPermissions(test).then(function(data) {
     *   const permissions = data[0];
     *   const apiResponse = data[1];
     * });
     */
    testPermissions(permissions, optionsOrCallback, callback) {
        if (!Array.isArray(permissions) && typeof permissions !== 'string') {
            throw new Error('Permissions are required.');
        }
        const { options, callback: cb } = util_1.normalize(optionsOrCallback, callback);
        const permissionsArray = arrify(permissions);
        const req = Object.assign({
            permissions: permissionsArray,
        }, options);
        this.request_({
            uri: '/iam/testPermissions',
            qs: req,
            useQuerystring: true,
        }, (err, resp) => {
            if (err) {
                cb(err, null, resp);
                return;
            }
            const availablePermissions = arrify(resp.permissions);
            const permissionsHash = permissionsArray.reduce((acc, permission) => {
                acc[permission] = availablePermissions.indexOf(permission) > -1;
                return acc;
            }, {});
            cb(null, permissionsHash, resp);
        });
    }
}
exports.Iam = Iam;
/*! Developer Documentation
 *
 * All async methods (except for streams) will return a Promise in the event
 * that a callback is omitted.
 */
promisify_1.promisifyAll(Iam);
//# sourceMappingURL=iam.js.map