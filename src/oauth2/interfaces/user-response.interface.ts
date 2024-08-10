/*
 Copyright (C) 2024 Afonso Barracha

 Nest OAuth is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Nest OAuth is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with Nest OAuth.  If not, see <https://www.gnu.org/licenses/>.
*/

export interface IMicrosoftUser {
  readonly businessPhones: string[];
  readonly displayName: string;
  readonly givenName: string;
  readonly jobTitle: string;
  readonly mail: string;
  readonly mobilePhone: string;
  readonly officeLocation: string;
  readonly preferredLanguage: string;
  readonly surname: string;
  readonly userPrincipalName: string;
  readonly id: string;
}

export interface IGoogleUser {
  readonly sub: string;
  readonly name: string;
  readonly given_name: string;
  readonly family_name: string;
  readonly picture: string;
  readonly email: string;
  readonly email_verified: boolean;
  readonly locale: string;
  readonly hd: string;
}

export interface IFacebookUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

interface IGitHubPlan {
  readonly name: string;
  readonly space: number;
  readonly private_repos: number;
  readonly collaborators: number;
}

export interface IGitHubUser {
  readonly login: string;
  readonly id: number;
  readonly node_id: string;
  readonly avatar_url: string;
  readonly gravatar_id: string;
  readonly url: string;
  readonly html_url: string;
  readonly followers_url: string;
  readonly following_url: string;
  readonly gists_url: string;
  readonly starred_url: string;
  readonly subscriptions_url: string;
  readonly organizations_url: string;
  readonly repos_url: string;
  readonly events_url: string;
  readonly received_events_url: string;
  readonly type: string;
  readonly site_admin: boolean;
  readonly name: string;
  readonly company: string;
  readonly blog: string;
  readonly location: string;
  readonly email: string;
  readonly hireable: boolean;
  readonly bio: string;
  readonly twitter_username: string;
  readonly public_repos: number;
  readonly public_gists: number;
  readonly followers: number;
  readonly following: number;
  readonly created_at: string;
  readonly updated_at: string;
  readonly private_gists: number;
  readonly total_private_repos: number;
  readonly owned_private_repos: number;
  readonly disk_usage: number;
  readonly collaborators: number;
  readonly two_factor_authentication: boolean;
  readonly plan: IGitHubPlan;
}
